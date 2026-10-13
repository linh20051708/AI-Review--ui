import { useSyncExternalStore } from "react"
import { classes, courseOfferings, courses, joinRequests, labTemplates, projects, ruleSets, semesters, studentGroups, students } from "@/data/mockData"
import type { ClassRoom, Course, CourseOffering, JoinRequest, LabTemplate, Project, RuleSet, Semester, Student, StudentGroup } from "@/types"

/** Supervisor-managed academic structure (semester, class, group, student, project metadata). */
interface State {
  semesters: Semester[]
  ruleSets: RuleSet[]
  courses: Course[]
  offerings: CourseOffering[]
  labTemplates: LabTemplate[]
  joinRequests: JoinRequest[]
  classes: ClassRoom[]
  groups: StudentGroup[]
  students: Student[]
  projects: Project[]
}

let state: State = { semesters, ruleSets, courses, offerings: courseOfferings, labTemplates, joinRequests, classes, groups: studentGroups, students, projects }
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useManagement = () => useSyncExternalStore(subscribe, () => state)

export function updateManagement(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) }
  listeners.forEach((l) => l())
}

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || `item-${Date.now()}`
