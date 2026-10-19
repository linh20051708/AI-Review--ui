import type { Project, ReviewRequest, LifecycleState, Tone } from "@/types"
import type { State } from "@/data/managementStore"

export const projectStateMeta: Record<LifecycleState, {label: string; tone: Tone}> = {
  active: { label: "Đang thực hiện", tone: "brand" },
  archived: { label: "Đã lưu trữ", tone: "neutral" },
}
// Closed review scenarios only; never change the active AI/upload/revision demos.
export const archivedSampleProjectIds = ["event-management-system", "canteen-ordering-system"] as const
export const sampleProjectState = (id: string): LifecycleState =>
  archivedSampleProjectIds.some(candidate => candidate === id) ? "archived" : "active"

/** One-time, guarded enrichment of untouched seed records. All user edits survive. */
export function seedProjectStatuses(s: State, baseline: Project[], reviews: ReviewRequest[] | undefined): State {
  if (s.projectStatusSeedVersion || !reviews) return s
  return { ...s, projectStatusSeedVersion: 1, projects: s.projects.map(p => {
    if (!archivedSampleProjectIds.some(id => id === p.id) || p.state !== "active") return p
    const original = baseline.find(b => b.id === p.id)
    if (!original || p.registrationId || s.registrations?.some(r => r.projectId === p.id && r.status === "pending")) return p
    // Equality deliberately excludes only lifecycle state; no edited seed is overwritten.
    const keys = new Set([...Object.keys(original), ...Object.keys(p)])
    if ([...keys].some(key => key !== "state" && JSON.stringify(p[key as keyof Project]) !== JSON.stringify(original[key as keyof Project]))) return p
    const linked = reviews.filter(r => r.projectId === p.id)
    if (!linked.length || linked.some(r => !["approved", "notAccepted"].includes(r.supervisorStatus))) return p
    return { ...p, state: "archived" }
  }) }
}
