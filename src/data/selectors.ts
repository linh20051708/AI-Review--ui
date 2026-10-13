import { aiFindings, documents, documentVersions } from "@/data/mockData"
import { classOfProject, offeringOf, resolveLabStructure } from "@/lib/config"
import type { ClassRoom, CourseOffering, DocumentVersion, Lab, Project, ProjectDocument, ReviewRequest, StudentGroup } from "@/types"

/** AI findings shown for a request, limited to its reported counts. */
export const findingsFor = (r: ReviewRequest) => [
  ...aiFindings.filter((f) => f.level === "error").slice(0, r.ai.errors),
  ...aiFindings.filter((f) => f.level === "warning").slice(0, r.ai.warnings),
  ...aiFindings.filter((f) => f.level === "suggestion").slice(0, r.ai.suggestions),
]

/** Immutable version list for the request's logical document; the current version reflects live supervisor status. */
export const versionsFor = (r: ReviewRequest): DocumentVersion[] => {
  const list = documentVersions.filter((v) => v.reviewId === r.id)
  const base: DocumentVersion[] = list.length
    ? list
    : [{ id: `${r.id}-cur`, reviewId: r.id, version: r.version, fileName: r.fileName, submittedAt: r.submittedAt, submitter: r.submitter, documentStatus: r.documentStatus, ai: r.ai, supervisorStatus: r.supervisorStatus, feedbackCount: 0, isCurrent: true }]
  return base.map((v) => (v.isCurrent ? { ...v, supervisorStatus: r.supervisorStatus } : v))
}

export const isCompleted = (s: ReviewRequest["supervisorStatus"]) => s === "approved" || s === "needsRevision" || s === "notAccepted"

/** Project deliverables inherited from the class's effective lab structure, with configured dependencies. */
export function documentsFor(project: Project | undefined, requests: ReviewRequest[], cfg: { classes: ClassRoom[]; offerings: CourseOffering[]; groups: StudentGroup[] }): (ProjectDocument & { lab: Lab })[] {
  if (!project) return []
  const cls = classOfProject(project, cfg.groups, cfg.classes)
  const labs = resolveLabStructure(cls, offeringOf(cls, cfg.offerings))
  const seeded = documents.filter((d) => d.projectId === project.id)
  const all = labs.flatMap((lab) => lab.items.map((item) => ({ lab, item })))
  const base = all.map(({ lab, item }, i) => {
    const req = requests.find((r) => r.projectId === project.id && r.documentTitle === item.title)
    const seed = seeded.find((d) => d.title === item.title)
    const common = { id: item.id, projectId: project.id, title: item.title, order: i + 1, labCode: lab.code, labTitle: lab.title, itemCode: item.code, required: item.required, lab }
    const doc: ProjectDocument & { lab: Lab } = seed
      ? { ...seed, ...common, reviewId: req?.id ?? seed.reviewId, supervisorStatus: req?.supervisorStatus ?? seed.supervisorStatus }
      : req
        ? { ...common, latestVersion: req.version, versionCount: Number(req.version.slice(1)), documentStatus: req.documentStatus, supervisorStatus: req.supervisorStatus, ai: req.ai, submitter: req.submitter, updatedAt: req.submittedAt.split(" · ")[0], reviewId: req.id }
        : { ...common, versionCount: 0, documentStatus: "notStarted" }
    return { doc, item }
  })
  // Lock submission while any configured prerequisite is not yet approved.
  return base.map(({ doc, item }) => {
    const unmet = item.dependsOn.map((id) => base.find((b) => b.item.id === id)).filter((b) => b && b.doc.supervisorStatus !== "approved")
    const blocked = unmet.length > 0 && doc.supervisorStatus !== "approved" && !doc.reviewId
    return { ...doc, dependsOn: unmet.map((b) => `${b!.item.code} ${b!.item.title}`).join(" và ") || undefined, submissionLocked: blocked || undefined }
  })
}
