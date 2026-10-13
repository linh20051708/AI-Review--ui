import { scheduleLabel, sessionMeta, timePresetLabels, type SchedulePattern, type Session, type TimePreset, type TimeRange } from "@/lib/time"

const chip = (on: boolean) => `inline-flex flex-col items-start rounded-[8px] border px-3 py-2 text-[13px] font-medium leading-[1.25] transition ${on ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink"}`

export function TimeRangeControl({ value, onChange, count }: { value?: TimeRange; onChange: (v?: TimeRange) => void; count?: (v: TimeRange) => number }) {
  const presets = Object.keys(timePresetLabels) as TimePreset[]
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const on = value?.preset === p
          return (
            <button key={p} type="button" aria-pressed={on} className={chip(on)} onClick={() => onChange(on ? undefined : p === "custom" ? { preset: "custom", from: "2026-10-01T00:00", to: "2026-10-10T23:59" } : { preset: p })}>
              <span>
                {timePresetLabels[p]}
                {count && p !== "custom" && <span className="ml-1.5 text-[11px] text-muted">{count({ preset: p })}</span>}
              </span>
            </button>
          )
        })}
      </div>
      {value?.preset === "custom" && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(["from", "to"] as const).map((k) => (
            <label key={k} className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-ink">{k === "from" ? "Từ" : "Đến"}</span>
              <input
                type="datetime-local"
                value={value[k] ?? ""}
                onChange={(e) => onChange({ ...value, [k]: e.target.value })}
                className="h-10 rounded-[8px] border border-line bg-white px-2.5 text-[13px] text-ink outline-none focus:border-brand"
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function SessionControl({ value, onChange, count }: { value?: Session; onChange: (v?: Session) => void; count: (v?: Session) => number }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={chip(!value)} onClick={() => onChange(undefined)}>Tất cả</button>
      {(Object.keys(sessionMeta) as Session[]).map((s) => (
        <button key={s} type="button" aria-pressed={value === s} title={sessionMeta[s].range} className={chip(value === s)} onClick={() => onChange(value === s ? undefined : s)}>
          <span>
            {sessionMeta[s].label}
            <span className="ml-1.5 text-[11px] text-muted">{count(s)}</span>
          </span>
        </button>
      ))}
    </div>
  )
}

const patterns: SchedulePattern[] = ["25", "36", "47"]
const weekdays = ["2", "3", "4", "5", "6", "7"]

export function ScheduleControl({ value, onChange, count }: { value?: string; onChange: (v?: string) => void; count: (v: string) => number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={chip(!value)} onClick={() => onChange(undefined)}>Tất cả</button>
        {patterns.map((p) => (
          <button key={p} type="button" aria-pressed={value === p} className={chip(value === p)} onClick={() => onChange(value === p ? undefined : p)}>
            <span>
              {scheduleLabel(p)}
              <span className="ml-1.5 text-[11px] text-muted">{count(p)}</span>
            </span>
            <span className="text-[10px] font-normal text-muted">{p}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {weekdays.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={value === d}
            onClick={() => onChange(value === d ? undefined : d)}
            className={`size-9 rounded-[8px] border text-[12px] font-semibold ${value === d ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink"}`}
          >
            T{d}
          </button>
        ))}
      </div>
    </div>
  )
}
