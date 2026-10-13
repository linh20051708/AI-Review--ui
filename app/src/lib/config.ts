import { parseISO } from "@/lib/time"
import type { ClassRoom, Course, CourseOffering, Lab, LabItem, Project, RuleSet, Semester, StudentGroup, TeachingMethod } from "@/types"

/**
 * Configuration inheritance: Course Offering → Class (optional override) → Project.
 * The most specific value wins; every resolver also reports where the value came from.
 */
/** Everything needed to resolve a project's academic context. */
export interface AcademicConfig {
  semesters: Semester[]
  courses: Course[]
  offerings: CourseOffering[]
  classes: ClassRoom[]
  groups: StudentGroup[]
  ruleSets: RuleSet[]
}

export type ConfigLayer = "project" | "class" | "offering" | "missing"
export interface Resolved<T> {
  value: T | undefined
  layer: ConfigLayer
  /** Human-readable origin, e.g. "Kế thừa từ SWP391 · Fall 2026". */
  source: string
}

/** A project's only academic link is its group; class (and everything above) is derived. */
export const groupOfProject = (project: Project, groups: StudentGroup[]) => groups.find((g) => g.id === project.groupId)
export const classOfProject = (project: Project, groups: StudentGroup[], classes: ClassRoom[]) => {
  const group = groupOfProject(project, groups)
  return classes.find((c) => c.id === group?.classId)
}

export const offeringOf = (c: ClassRoom | undefined, offerings: CourseOffering[]) => offerings.find((o) => o.id === c?.offeringId)

export const offeringLabel = (offering: CourseOffering | undefined, courses: Course[], semesters: Semester[]) => {
  if (!offering) return "môn học trong học kỳ"
  const course = courses.find((c) => c.id === offering.courseId)
  const semester = semesters.find((s) => s.id === offering.semesterId)
  return `${course?.code ?? offering.courseId} · ${semester?.name ?? offering.semesterId}`
}

/** Lab structure: Class override → Course Offering. */
export const resolveLabStructure = (cls: ClassRoom | undefined, offering: CourseOffering | undefined): Lab[] => cls?.labOverride ?? offering?.labs ?? []

/** Teaching method: Project override → Class override → Course Offering. */
export function resolveTeachingMethod(project: Project | undefined, cls: ClassRoom | undefined, offering: CourseOffering | undefined, label = "môn học trong học kỳ"): Resolved<TeachingMethod> {
  if (project?.teachingMethodOverride) return { value: project.teachingMethodOverride, layer: "project", source: "Tùy chỉnh cho project" }
  if (cls?.teachingMethodOverride) return { value: cls.teachingMethodOverride, layer: "class", source: `Tùy chỉnh cho lớp ${cls.code}` }
  if (offering) return { value: offering.teachingMethod, layer: "offering", source: `Kế thừa từ ${label}` }
  return { value: undefined, layer: "missing", source: "Chưa cấu hình" }
}

/** Rule set: Class override → Course Offering. */
export function resolveRuleSet(cls: ClassRoom | undefined, offering: CourseOffering | undefined, ruleSets: RuleSet[], label = "môn học trong học kỳ"): Resolved<RuleSet> {
  if (cls?.ruleSetOverride) return { value: ruleSets.find((r) => r.id === cls.ruleSetOverride), layer: "class", source: `Tùy chỉnh cho lớp ${cls.code}` }
  if (offering) return { value: ruleSets.find((r) => r.id === offering.ruleSetId), layer: "offering", source: `Kế thừa từ ${label}` }
  return { value: undefined, layer: "missing", source: "Chưa cấu hình" }
}

export interface ProjectAcademicContext {
  project: Project
  group: StudentGroup | undefined
  cls: ClassRoom | undefined
  offering: CourseOffering | undefined
  semester: Semester | undefined
  course: Course | undefined
  offeringLabel: string
  teachingMethod: Resolved<TeachingMethod>
  ruleSet: Resolved<RuleSet>
  labs: Lab[]
}

/** Project → Group → Class → Course Offering → (Semester, Course, config). */
export function resolveProjectAcademicContext(project: Project, cfg: AcademicConfig): ProjectAcademicContext {
  const group = groupOfProject(project, cfg.groups)
  const cls = cfg.classes.find((c) => c.id === group?.classId)
  const offering = offeringOf(cls, cfg.offerings)
  const semester = cfg.semesters.find((s) => s.id === (offering?.semesterId ?? cls?.semesterId))
  const course = cfg.courses.find((c) => c.id === (offering?.courseId ?? cls?.courseId))
  const label = offeringLabel(offering, cfg.courses, cfg.semesters)
  return {
    project,
    group,
    cls,
    offering,
    semester,
    course,
    offeringLabel: label,
    teachingMethod: resolveTeachingMethod(project, cls, offering, label),
    ruleSet: resolveRuleSet(cls, offering, cfg.ruleSets, label),
    labs: resolveLabStructure(cls, offering),
  }
}

/** Lab + item a document (by title) belongs to, within the project's effective structure. */
export const resolveDocumentLabContext = (documentTitle: string, ctx: Pick<ProjectAcademicContext, "labs">) => locateItem(ctx.labs, documentTitle)

/** Item → Lab → Class → Course Offering. */
export function effectiveDeadline(item: LabItem | undefined, lab: Lab | undefined, c: ClassRoom | undefined, offering: CourseOffering | undefined): { ts?: number; source: string } {
  if (item?.deadline) return { ts: parseISO(item.deadline), source: `Mục ${item.code}` }
  if (lab?.deadline) return { ts: parseISO(lab.deadline), source: lab.code }
  if (c?.deadline) return { ts: parseISO(c.deadline), source: `Lớp ${c.code}` }
  if (offering) return { ts: parseISO(offering.defaultDeadline), source: "Môn học trong học kỳ" }
  return { source: "Chưa đặt" }
}

/** Find the lab item a document belongs to (matching by title within the class structure). */
export function locateItem(labs: Lab[], title: string) {
  for (const lab of labs) {
    const it = lab.items.find((i) => i.title === title || i.documentType === title)
    if (it) return { lab, item: it }
  }
  return undefined
}

let seq = 0
const nid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

/** Deep copy with fresh ids and remapped dependencies — copies never share mutable structure. */
export function cloneLabs(list: Lab[]): Lab[] {
  const idMap = new Map<string, string>()
  list.forEach((l) => l.items.forEach((i) => idMap.set(i.id, nid("it"))))
  return list.map((l) => ({
    ...l,
    id: nid("lab"),
    items: l.items.map((i) => ({ ...i, id: idMap.get(i.id)!, dependsOn: i.dependsOn.map((d) => idMap.get(d) ?? d) })),
  }))
}

export const cloneLab = (lab: Lab, code?: string) => ({ ...cloneLabs([lab])[0], ...(code && { code }) })

/** Suggest the next item code: "1.3" → "1.4", "REQ-01" → "REQ-02", first item of "Lab 2" → "2.1". */
export function suggestItemCode(lab: Lab) {
  const last = lab.items.at(-1)?.code
  if (last) {
    const m = last.match(/^(.*?)(\d+)$/)
    if (m) return `${m[1]}${String(Number(m[2]) + 1).padStart(m[2].length, "0")}`
    return `${last}-2`
  }
  const n = lab.code.match(/(\d+)\s*$/)?.[1]
  return n ? `${n}.1` : "1"
}

export function suggestLabCode(labs: Lab[]) {
  const nums = labs.map((l) => Number(l.code.match(/(\d+)\s*$/)?.[1])).filter((n) => !Number.isNaN(n))
  return `Lab ${nums.length ? Math.max(...nums) + 1 : labs.length + 1}`
}

export const nextId = nid
