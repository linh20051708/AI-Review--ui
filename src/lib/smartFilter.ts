import { matchesSchedule, resolveRange, type SchedulePattern, type Session, type TimeRange } from "@/lib/time"

/** Facet categories in cascading priority order. */
export const FACETS = ["semester", "course", "class", "lab", "labItem", "docType", "group", "project", "status", "documentStatus", "evaluationStatus", "ai", "legacyReviewStatus"] as const
export type FacetKey = (typeof FACETS)[number]
/** Upstream facets narrow the options of downstream ones; invalid downstream selections are pruned. */
export const HIERARCHY: FacetKey[] = ["semester", "course", "class", "lab", "labItem", "docType", "group", "project"]

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

/** Scope comes only from parents; child selections cannot hide a replacement parent. */
function upstreamState(s: FilterState, key: FacetKey): FilterState {
  const parents = HIERARCHY.slice(0, HIERARCHY.indexOf(key))
  return { facets: Object.fromEntries(parents.map(k => [k, s.facets[k]])), q: "" }
}

/** Counts are disjunctive: results for this value with the other filters applied. */
export function facetOptions(records: FilterRecord[], s: FilterState, key: FacetKey, includeValues: string[] = []): FacetOption[] {
  const hierarchical = HIERARCHY.includes(key)
  const scope = hierarchical ? records.filter(r => matches(r, upstreamState(s,key))) : records
  const values = new Set(scope.map(r => r[key]).filter((v): v is string => Boolean(v)))
  if (!hierarchical) for (const value of includeValues) values.add(value)
  const options = [...values].map(value => {
    const candidate = { ...s, facets: { ...s.facets, [key]: [value] } }
    const count = filterRecords(records, hierarchical ? prune(records,candidate) : candidate).length
    return {value,count}
  })
  return options.filter(o => o.count > 0 || s.facets[key]?.includes(o.value) || (!hierarchical && includeValues.includes(o.value)))
}

/** Validate children against parents only, never against search/status or descendants. */
export function prune(records: FilterRecord[], s: FilterState): FilterState {
  let next = s
  for (const key of HIERARCHY) {
    const sel = next.facets[key]
    if (!sel?.length) continue
    const valid = new Set(records.filter(r => matches(r, upstreamState(next,key))).map(r => r[key]))
    const kept = sel.filter(v => valid.has(v))
    if (kept.length !== sel.length) next = { ...next, facets: { ...next.facets, [key]: kept } }
  }
  return next
}

/** Preserve the exact OR semantics of saved review views from the old combined status. */
export function restoreReviewView(s: FilterState, legacy: boolean): FilterState {
  if (!legacy || !s.facets.status?.length) return s
  return {...s, facets:{...s.facets,status:[],legacyReviewStatus:s.facets.status}}
}

export const activeFilterCount = (s: FilterState, exclude: FacetKey[] = []) =>
  FACETS.filter((k) => !exclude.includes(k) && s.facets[k]?.length).length + (s.time ? 1 : 0) + (s.session ? 1 : 0) + (s.schedule ? 1 : 0)
