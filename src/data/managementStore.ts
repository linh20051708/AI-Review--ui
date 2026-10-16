import { useSyncExternalStore } from "react"
import {
  classes,
  courseOfferings,
  courses,
  joinRequests,
  labTemplates,
  projects,
  ruleSets,
  semesters,
  studentGroups,
  students,
} from "@/data/mockData"
import type {
  ClassRoom,
  Course,
  CourseOffering,
  JoinRequest,
  LabTemplate,
  Project,
  RuleSet,
  Semester,
  Student,
  StudentGroup,
} from "@/types"
import { normalizeRule, personaTemplate, validateRule } from "@/lib/rubric"
import { seedDemoManagement } from "@/data/demoSeed"

/** Supervisor-managed academic structure (semester, class, group, student, project metadata). */
export interface State {
  demoSeedVersion?: number
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

const initial = (): State => seedDemoManagement({
  semesters,
  ruleSets: [...ruleSets.map(normalizeRule), structuredClone(personaTemplate)],
  courses,
  offerings: courseOfferings,
  labTemplates,
  joinRequests,
  classes,
  groups: studentGroups,
  students,
  projects,
})
const storageKey = "project-review:management:v2"
const load = (): State => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      const value = JSON.parse(raw)
      if (
        Array.isArray(value.ruleSets) &&
        Array.isArray(value.offerings) &&
        Array.isArray(value.projects)
      )
        return value
    }
  } catch {
    /* use seed */
  }
  return initial()
}
let state: State = seedDemoManagement(load())
try {
  localStorage.setItem(storageKey, JSON.stringify(state))
} catch { /* Memory-only fallback when storage is unavailable. */ }
export const getManagementState = () => state
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useManagement = () => useSyncExternalStore(subscribe, () => state)

export function updateManagement(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) }
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    /* memory only */
  }
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

/** Re-seed the whole academic structure (used by Reset Demo Data). */
export function resetManagement() {
  state = initial()
  try {
    localStorage.removeItem(storageKey)
  } catch {
    /* memory only */
  }
  listeners.forEach((l) => l())
}

export function saveRuleSet(input: RuleSet) {
  const error = validateRule(input)
  if (error) throw new Error(error)
  const old = state.ruleSets.find((r) => r.id === input.id)
  const saved = structuredClone({
    ...input,
    version: old ? (old.version ?? 1) + 1 : 1,
  })
  updateManagement((s) => ({
    ruleSets: old
      ? s.ruleSets.map((r) => (r.id === saved.id ? saved : r))
      : [...s.ruleSets, saved],
  }))
  return saved
}
