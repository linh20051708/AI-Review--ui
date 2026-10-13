import { matchesSchedule, resolveRange, type SchedulePattern, type Session, type TimeRange } from "@/lib/time"

/** Facet categories in cascading priority order. */
export const FACETS = ["semester", "course", "class", "lab", "group", "project", "docType", "status", "ai"] as const
export type FacetKey = (typeof FACETS)[number]
/** Upstream facets narrow the options of downstream ones; invalid downstream selections are pruned. */
export const HIERARCHY: FacetKey[] = ["semester", "course", "class", "lab", "group", "project"]

export type FilterRecord = Partial<Record<FacetKey, string>> & {
  ts?: number
  session?: Session
  schedule?: SchedulePattern
  /** Lower-cased haystack for free-text search. */
  text?: string
}

export interface FilterState {
  facets: Partial<Record<FacetKey, string[]>>
  time?: TimeRange
  session?: Session
  /** Schedule pattern ("25") or weekday ("2"…"7"). */
  schedule?: string
  q: string
}

export const emptyFilter: FilterState = { facets: {}, q: "" }

/** AND across categories, OR within a category. `except` skips one facet (for computing its own options). */
export function matches(r: FilterRecord, s: FilterState, except?: FacetKey | "time" | "session" | "schedule") {
  for (const key of FACETS) {
    if (key === except) continue
    const sel = s.facets[key]
    if (sel?.length && !sel.includes(r[key] ?? "")) return false
  }
  if (s.time && except !== "time" && r.ts !== undefined) {
    const [from, to] = resolveRange(s.time)
    if (r.ts < from || r.ts > to) return false
  }
  if (s.session && except !== "session" && r.session && r.session !== s.session) return false
  if (s.schedule && except !== "schedule" && r.schedule && !matchesSchedule(r.schedule, s.schedule)) return false
  if (s.q.trim() && r.text !== undefined && !r.text.includes(s.q.trim().toLowerCase())) return false
  return true
}

export const filterRecords = <T extends FilterRecord>(records: T[], s: FilterState) => records.filter((r) => matches(r, s))

export interface FacetOption {
  value: string
  count: number
}

/** Options for one facet given every other active filter. Zero-count values are hidden unless selected. */
export function facetOptions(records: FilterRecord[], s: FilterState, key: FacetKey): FacetOption[] {
  const counts = new Map<string, number>()
  for (const r of records) {
    const v = r[key]
    if (!v || !matches(r, s, key)) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  for (const v of s.facets[key] ?? []) if (!counts.has(v)) counts.set(v, 0)
  return [...counts].map(([value, count]) => ({ value, count }))
}

/** Drop hierarchy selections that no longer exist under upstream choices. */
export function prune(records: FilterRecord[], s: FilterState): FilterState {
  let next = s
  for (const key of HIERARCHY) {
    const sel = next.facets[key]
    if (!sel?.length) continue
    const valid = new Set(facetOptions(records, next, key).filter((o) => o.count > 0).map((o) => o.value))
    const kept = sel.filter((v) => valid.has(v))
    if (kept.length !== sel.length) next = { ...next, facets: { ...next.facets, [key]: kept } }
  }
  return next
}

export const activeFilterCount = (s: FilterState, exclude: FacetKey[] = []) =>
  FACETS.filter((k) => !exclude.includes(k) && s.facets[k]?.length).length + (s.time ? 1 : 0) + (s.session ? 1 : 0) + (s.schedule ? 1 : 0)
