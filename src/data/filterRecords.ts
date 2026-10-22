import { projectStateMeta } from "@/data/projectStatuses"
import { reviewAI } from "@/lib/reviewPresentation"
import type { FilterRecord, FilterState } from "@/lib/smartFilter"
import { classOfProject, groupOfProject, locateItem, offeringOf, resolveLabStructure } from "@/lib/config"
import type { ClassRoom, CourseOffering, Project, ProjectDocument, ReviewRequest, StudentGroup, AIEvaluation } from "@/types"

export const reviewStatusLabels: Record<string, string> = {
  waiting: "Chờ đánh giá",
  inReview: "Đang đánh giá",
  needsRevision: "Cần chỉnh sửa",
  approved: "Đã phê duyệt",
  notAccepted: "Không đạt",
}

export const reviewStatusKey = (r: ReviewRequest) =>
  r.supervisorStatus === "waiting" ? (r.documentStatus === "resubmitted" ? "resubmitted" : "waiting") : r.supervisorStatus === "inReview" ? "inReview" : r.supervisorStatus === "needsRevision" ? "needsRevision" : "done"


const teaching = (c: ClassRoom | undefined) => ({ session: c?.session, schedule: c?.schedule })

/** Academic facets of a project, derived through Group → Class. */
const projectFacets = (p: Project, groups: StudentGroup[], classes: ClassRoom[]) => {
  const c = classOfProject(p, groups, classes)
  return { semester: c?.semesterId, course: c?.courseId, class: c?.id, group: p.groupId, project: p.id, ...teaching(c) }
}

export type RequestRecord = FilterRecord & { item: ReviewRequest }
/** Lab + item a request belongs to, resolved from its class's effective structure. */
export const labOf = (r: ReviewRequest, classes: ClassRoom[], offerings: CourseOffering[]) => {
  const cls = classes.find((c) => c.id === r.classId)
  const labs = resolveLabStructure(cls, offeringOf(cls, offerings))
  for (const lab of labs) {
    const item = lab.items.find(i => i.id === r.documentId)
    if (item) return {lab,item}
  }
  return locateItem(labs, r.documentTitle)
}

export const requestRecords = (requests: ReviewRequest[], classes: ClassRoom[], offerings: CourseOffering[], evaluations: AIEvaluation[] = []): RequestRecord[] =>
  requests.map((r) => {
    const location = labOf(r, classes, offerings)
    const evaluation = reviewAI(r, evaluations)
    return {
    item: r,
    lab: location ? `${r.classId}::${location.lab.code}` : undefined,
    labItem: `${r.classId}::${location?.item.id ?? r.documentId ?? r.documentTitle}::${r.documentTitle}`,
    semester: r.semesterId,
    course: r.courseId,
    class: r.classId,
    group: r.groupId,
    project: r.projectId,
    docType: r.documentTitle,
    status: r.supervisorStatus,
    legacyReviewStatus: reviewStatusKey(r),
    documentStatus: r.documentStatus,
    evaluationStatus: evaluation.status,
    ai: evaluation.counts ? (evaluation.counts.errors > 0 ? "hasErrors" : "clean") : evaluation.status === "loading" ? "running" : "notRun",
    ts: r.requestedTs,
    ...teaching(classes.find((c) => c.id === r.classId)),
    text: `${r.projectName} ${r.documentTitle} ${r.submitter} ${r.classCode} ${r.groupName}`.toLowerCase(),
  }})

export const projectStatusLabels: Record<string, string> = { active: projectStateMeta.active.label, archived: projectStateMeta.archived.label }

export type ProjectRecord = FilterRecord & { item: Project }
export const projectRecords = (projects: Project[], groups: StudentGroup[], classes: ClassRoom[]): ProjectRecord[] =>
  projects.map((p) => ({
    item: p,
    ...projectFacets(p, groups, classes),
    status: p.state,
    text: `${p.name} ${groupOfProject(p, groups)?.name ?? ""} ${p.description}`.toLowerCase(),
  }))

export type ClassRecord = FilterRecord & { item: ClassRoom }
export const classRecords = (classes: ClassRoom[]): ClassRecord[] =>
  classes.map((c) => ({ item: c, semester: c.semesterId, course: c.courseId, class: c.id, status: c.state, session: c.session, schedule: c.schedule, text: c.code.toLowerCase() }))

export const docStatusLabels: Record<string, string> = {
  submitted: "Đã nộp",
  resubmitted: "Đã nộp lại",
  waiting: "Chờ đánh giá",
  inReview: "Đang đánh giá",
  needsRevision: "Cần chỉnh sửa",
  approved: "Đã phê duyệt",
  notAccepted: "Không đạt",
  draft: "Bản nháp",
  locked: "Khóa gửi đánh giá",
  notStarted: "Chưa bắt đầu",
}

export type DocRecord = FilterRecord & { item: ProjectDocument; project: string }
export const documentRecord = (d: ProjectDocument, p: Project, groups: StudentGroup[], classes: ClassRoom[]): DocRecord => ({
  item: d,
  ...projectFacets(p, groups, classes),
  docType: d.title,
  lab: d.labCode ? `${classOfProject(p, groups, classes)?.id}::${d.labCode}` : undefined,
  labItem: `${classOfProject(p, groups, classes)?.id}::${d.id}::${d.title}`,
  documentStatus: d.documentStatus,
  status: d.supervisorStatus ?? (d.submissionLocked && d.documentStatus !== "notStarted" ? "locked" : d.documentStatus),
  text: `${d.title} ${p.name}`.toLowerCase(),
})

/** Default for actionable lists: current semester only. */
export const semesterDefault = (semesterId?: string): FilterState => ({ facets: semesterId ? { semester: [semesterId] } : {}, q: "" })
