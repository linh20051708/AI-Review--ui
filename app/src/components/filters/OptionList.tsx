import { Check, Search } from "lucide-react"
import { useState } from "react"
import type { LabeledOption } from "./useFacetLabels"

interface Props {
  options: LabeledOption[]
  selected: string[]
  onToggle: (value: string) => void
  single?: boolean
  searchPlaceholder?: string
  /** "chips" for ≤10 options in the drawer; list otherwise. */
  variant?: "list" | "chips"
}

const VISIBLE = 12

/** Short-list optimized: all options when ≤10, otherwise search + top 12 + "Xem thêm". */
export default function OptionList({ options, selected, onToggle, single, searchPlaceholder = "Tìm...", variant = "list" }: Props) {
  const [q, setQ] = useState("")
  const [expanded, setExpanded] = useState(false)
  const searchable = options.length > 10
  const filtered = q.trim() ? options.filter((o) => `${o.label} ${o.sub ?? ""}`.toLowerCase().includes(q.trim().toLowerCase())) : options
  const shown = searchable && !expanded && !q ? filtered.slice(0, VISIBLE) : filtered

  if (!options.length) return <p className="py-2 text-[12px] text-muted">Không có lựa chọn phù hợp với bộ lọc hiện tại.</p>

  if (variant === "chips" && !searchable)
    return (
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = selected.includes(o.value)
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(o.value)}
              className={`inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-2 text-[13px] font-medium transition ${on ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink"}`}
            >
              {o.label}
              {o.current && <span className="text-[10px] font-semibold text-brand">Hiện tại</span>}
              <span className={`text-[11px] ${on ? "text-brand" : "text-muted"}`}>{o.count}</span>
            </button>
          )
        })}
      </div>
    )

  return (
    <div className="flex flex-col gap-1">
      {searchable && (
        <label className="mb-1 flex h-9 items-center gap-2 rounded-[8px] border border-line bg-white px-2.5 focus-within:border-brand">
          <Search size={15} strokeWidth={1.75} className="text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted" />
        </label>
      )}
      <ul role="listbox" aria-multiselectable={!single} className="flex flex-col">
        {shown.map((o) => {
          const on = selected.includes(o.value)
          return (
            <li key={o.value}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => onToggle(o.value)}
                className={`flex w-full items-center gap-2.5 rounded-[6px] px-2 py-2 text-left hover:bg-subtle ${on ? "bg-brand-tint" : ""}`}
              >
                <span className={`flex size-4 shrink-0 items-center justify-center border ${single ? "rounded-full" : "rounded-[4px]"} ${on ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>
                  {on && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1 leading-[1.35]">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    <span className="truncate">{o.label}</span>
                    {o.current && <span className="rounded-[4px] bg-brand-soft px-1.5 text-[10px] font-semibold text-brand">Hiện tại</span>}
                  </span>
                  {o.sub && <span className="block truncate text-[11px] text-muted">{o.sub}</span>}
                </span>
                <span className="shrink-0 text-[12px] text-muted tabular-nums">{o.count}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {searchable && !expanded && !q && filtered.length > VISIBLE && (
        <button type="button" onClick={() => setExpanded(true)} className="inline-flex min-h-12 items-center self-start px-2 text-[12px] font-semibold text-brand">
          Xem thêm {filtered.length - VISIBLE}
        </button>
      )}
    </div>
  )
}
