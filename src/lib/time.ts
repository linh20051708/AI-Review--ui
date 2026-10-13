/** Demo clock so relative times and "current semester" are stable against the mock data. */
export const NOW = new Date(2026, 9, 3, 10, 20).getTime()

const p2 = (n: number) => String(n).padStart(2, "0")
const DAY = 86_400_000

/** "03/10/2026 · 08:15" → timestamp */
export const parseVN = (s: string) => {
  const [d, t = "00:00"] = s.split(" · ")
  const [dd, mm, yyyy] = d.split("/").map(Number)
  const [hh, mi] = t.split(":").map(Number)
  return new Date(yyyy, mm - 1, dd, hh, mi).getTime()
}

/** ISO date or datetime ("2026-12-15" / "2026-12-15T23:59") → timestamp */
export const parseISO = (s: string) => {
  const [d, t = "00:00"] = s.split("T")
  const [y, m, dd] = d.split("-").map(Number)
  const [hh, mi] = t.split(":").map(Number)
  return new Date(y, m - 1, dd, hh, mi).getTime()
}

export const fmtDate = (ts: number) => {
  const d = new Date(ts)
  return `${p2(d.getDate())}/${p2(d.getMonth() + 1)}/${d.getFullYear()}`
}
export const fmtTime = (ts: number) => {
  const d = new Date(ts)
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`
}
export const fmtDateTime = (ts: number) => `${fmtDate(ts)} · ${fmtTime(ts)}`
export const isoDate = (ts: number) => {
  const d = new Date(ts)
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
}
export const isoDateTime = (ts: number) => `${isoDate(ts)}T${fmtTime(ts)}`

const startOfDay = (ts: number) => {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** 15 phút trước · 2 giờ trước · Hôm qua · 14:30 · 03/10/2026 · 08:15 */
export const fmtRelative = (ts: number, now = NOW) => {
  const diff = now - ts
  if (diff < 0) return fmtDateTime(ts)
  if (diff < 60_000) return "Vừa xong"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`
  if (ts >= startOfDay(now)) return `${Math.floor(diff / 3_600_000)} giờ trước`
  if (ts >= startOfDay(now) - DAY) return `Hôm qua · ${fmtTime(ts)}`
  return fmtDateTime(ts)
}

export type TimePreset = "today" | "yesterday" | "7d" | "30d" | "thisWeek" | "lastWeek" | "thisMonth" | "custom"

export const timePresetLabels: Record<TimePreset, string> = {
  today: "Hôm nay",
  yesterday: "Hôm qua",
  "7d": "7 ngày gần đây",
  "30d": "30 ngày gần đây",
  thisWeek: "Tuần này",
  lastWeek: "Tuần trước",
  thisMonth: "Tháng này",
  custom: "Tùy chọn",
}

export interface TimeRange {
  preset: TimePreset
  /** Only used for custom; ISO datetime strings. */
  from?: string
  to?: string
}

/** Resolve a preset to an inclusive [from, to] timestamp range. */
export const resolveRange = (r: TimeRange, now = NOW): [number, number] => {
  const today = startOfDay(now)
  const monday = today - ((new Date(today).getDay() + 6) % 7) * DAY
  switch (r.preset) {
    case "today":
      return [today, today + DAY - 1]
    case "yesterday":
      return [today - DAY, today - 1]
    case "7d":
      return [today - 6 * DAY, today + DAY - 1]
    case "30d":
      return [today - 29 * DAY, today + DAY - 1]
    case "thisWeek":
      return [monday, monday + 7 * DAY - 1]
    case "lastWeek":
      return [monday - 7 * DAY, monday - 1]
    case "thisMonth": {
      const d = new Date(today)
      return [new Date(d.getFullYear(), d.getMonth(), 1).getTime(), new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() - 1]
    }
    case "custom":
      return [r.from ? parseISO(r.from) : -Infinity, r.to ? parseISO(r.to) + 59_999 : Infinity]
  }
}

export const rangeLabel = (r: TimeRange) => {
  if (r.preset !== "custom") return timePresetLabels[r.preset]
  const [a, b] = resolveRange(r)
  const f = (ts: number) => fmtDate(ts).slice(0, 5)
  return `${Number.isFinite(a) ? f(a) : "…"} – ${Number.isFinite(b) ? f(b) : "…"}`
}

export type Session = "morning" | "afternoon" | "evening"
export const sessionMeta: Record<Session, { label: string; range: string }> = {
  morning: { label: "Sáng", range: "07:00–12:00" },
  afternoon: { label: "Chiều", range: "12:00–17:30" },
  evening: { label: "Tối", range: "17:30–21:30" },
}

export type SchedulePattern = "25" | "36" | "47"
export const scheduleLabel = (p: SchedulePattern) => `T${p[0]} – T${p[1]}`
/** Filter value: a pattern ("25") or a single weekday ("2"…"7"). */
export const matchesSchedule = (pattern: SchedulePattern, value: string) => (value.length === 2 ? pattern === value : pattern.includes(value))
