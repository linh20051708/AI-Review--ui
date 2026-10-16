import { aiFindings, documents } from "@/data/mockData"
import {
  classOfProject,
  offeringOf,
  resolveLabStructure,
  resolveRuleSet,
} from "@/lib/config"
import { getManagementState } from "@/data/managementStore"
import type {
  ClassRoom,
  CourseOffering,
  DocumentVersion,
  Lab,
  Project,
  ProjectDocument,
  ReviewRequest,
  StudentGroup,
} from "@/types"

/** AI findings shown for a request, limited to its reported counts. */
export const findingsFor = (r: ReviewRequest) => [
  ...aiFindings.filter((f) => f.level === "error").slice(0, r.ai.errors),
  ...aiFindings.filter((f) => f.level === "warning").slice(0, r.ai.warnings),
  ...aiFindings
    .filter((f) => f.level === "suggestion")
    .slice(0, r.ai.suggestions),
]

/** Immutable version list for the request's logical document; the current version reflects live supervisor status. */
export const versionsFor = (
  r: ReviewRequest,
  versions: DocumentVersion[],
): DocumentVersion[] => {
  const list = versions.filter((v) => v.reviewId === r.id)
  const base: DocumentVersion[] = list.length
    ? list
    : [
        {
          id: `${r.id}-cur`,
          reviewId: r.id,
          version: r.version,
          fileName: r.fileName,
          submittedAt: r.submittedAt,
          submitter: r.submitter,
          documentStatus: r.documentStatus,
          ai: r.ai,
          supervisorStatus: r.supervisorStatus,
          feedbackCount: 0,
          isCurrent: true,
        },
      ]
  return base.map((v) =>
    v.isCurrent
      ? {
          ...v,
          supervisorStatus: r.supervisorStatus,
          ai: r.ai,
          fileType: r.fileType,
          fileSize: r.fileSize,
          pageCount: r.pageCount,
        }
      : v,
  )
}

export const isCompleted = (s: ReviewRequest["supervisorStatus"]) =>
  s === "approved" || s === "needsRevision" || s === "notAccepted"

/** Project deliverables inherited from the class's effective lab structure, with configured dependencies. */
export function documentsFor(
  project: Project | undefined,
  requests: ReviewRequest[],
  cfg: {
    classes: ClassRoom[]
    offerings: CourseOffering[]
    groups: StudentGroup[]
  },
): (ProjectDocument & { lab: Lab })[] {
  if (!project) return []
  const cls = classOfProject(project, cfg.groups, cfg.classes)
  const labs = resolveLabStructure(cls, offeringOf(cls, cfg.offerings))
  const seeded = documents.filter((d) => d.projectId === project.id)
  const all = labs.flatMap((lab) => lab.items.map((item) => ({ lab, item })))
  const base = all.map(({ lab, item }, i) => {
    const req = requests.find(
      (r) =>
        r.projectId === project.id &&
        (r.documentId
          ? r.documentId === item.id
          : r.documentTitle === item.title),
    )
    const seed = seeded.find((d) => d.title === item.title)
    const common = {
      id: item.id,
      projectId: project.id,
      title: item.title,
      order: i + 1,
      labCode: lab.code,
      labTitle: lab.title,
      itemCode: item.code,
      required: item.required,
      lab,
    }
    const doc: ProjectDocument & { lab: Lab } = seed
      ? {
          ...seed,
          ...common,
          ...(req
            ? {
                latestVersion: req.version,
                versionCount: Number(req.version.slice(1)),
                documentStatus: req.documentStatus,
                ai: req.ai,
                submitter: req.submitter,
                updatedAt: req.submittedAt,
                reviewId: req.id,
                supervisorStatus: req.supervisorStatus,
              }
            : {}),
        }
      : req
        ? {
            ...common,
            latestVersion: req.version,
            versionCount: Number(req.version.slice(1)),
            documentStatus: req.documentStatus,
            supervisorStatus: req.supervisorStatus,
            ai: req.ai,
            submitter: req.submitter,
            updatedAt: req.submittedAt.split(" · ")[0],
            reviewId: req.id,
          }
        : { ...common, versionCount: 0, documentStatus: "notStarted" }
    return { doc, item }
  })
  // Lock submission while any configured prerequisite is not yet approved.
  return base.map(({ doc, item }) => {
    const rules = getManagementState().ruleSets
    const rule = item.ruleSetId
      ? rules.find((r) => r.id === item.ruleSetId)
      : resolveRuleSet(cls, offeringOf(cls, cfg.offerings), rules).value
    const unmet =
      rule?.prerequisiteApproval === false
        ? []
        : item.dependsOn.filter(
            (id) =>
              base.find((b) => b.item.id === id)?.doc.supervisorStatus !==
              "approved",
          )
    const blocked = unmet.length > 0 && doc.supervisorStatus !== "approved"
    return {
      ...doc,
      dependsOn:
        unmet
          .map((id) => {
            const b = base.find((b) => b.item.id === id)
            return b
              ? `${b.item.code} ${b.item.title}`
              : `Mục ${id} chưa tồn tại`
          })
          .join(" và ") || undefined,
      submissionLocked: blocked || undefined,
    }
  })
}
