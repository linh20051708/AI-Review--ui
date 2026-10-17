import { Bookmark, BookmarkPlus, Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import MoreMenu from "@/components/ui/MoreMenu"
import { toast } from "@/components/ui/Toast"
import { activeFilterCount, facetOptions, filterRecords, HIERARCHY, prune, type FacetKey, type FilterRecord, type FilterState } from "@/lib/smartFilter"
import { rangeLabel, scheduleLabel, sessionMeta, type SchedulePattern } from "@/lib/time"
import OptionList from "./OptionList"
import Popover from "./Popover"
import { ScheduleControl, SessionControl, TimeRangeControl } from "./TimeControls"
import useFacetLabels, { facetTitles } from "./useFacetLabels"

export interface SmartFilterProps {
  records: FilterRecord[]
  state: FilterState
  onChange: (s: FilterState) => void
  /** Facets available on this page (semester is always the context switcher). */
  facets: FacetKey[]
  /** Facets shown inline in the desktop toolbar. The rest live under "Bộ lọc khác". */
  primary: FacetKey[]
  time?: boolean
  teaching?: boolean
  statusLabels?: Record<string, string>
  searchPlaceholder: string
  noun: string
  sort?: { options: string[]; value: string; onChange: (v: string) => void }
  viewKey: string
  extra?: ReactNode
}

const SECTIONS: { title: string; keys: (FacetKey | "time" | "session" | "schedule")[] }[] = [
  { title: "Học vụ", keys: ["semester", "course", "class", "group"] },
  { title: "Lab & Project", keys: ["lab", "project", "docType"] },
  { title: "Review", keys: ["status", "ai"] },
  { title: "Thời gian", keys: ["time", "session", "schedule"] },
]
const timeTitles = { time: "Thời gian gửi", session: "Buổi học", schedule: "Lịch học" }

interface SavedView {
  name: string
  state: FilterState
}

export default function SmartFilterBar(props: SmartFilterProps) {
  const { records, state, onChange, facets, primary, time, teaching, statusLabels, searchPlaceholder, noun, sort, viewKey, extra } = props
  const { label, decorate } = useFacetLabels(statusLabels)
  const [drawer, setDrawer] = useState<"all" | "more" | null>(null)
  const [views, setViews] = useState<SavedView[]>(() => JSON.parse(localStorage.getItem(`filters:${viewKey}`) ?? "[]"))
  useEffect(() => localStorage.setItem(`filters:${viewKey}`, JSON.stringify(views)), [views, viewKey])

  const set = (s: FilterState) => onChange(prune(records, s))
  const toggle = (s: FilterState, key: FacetKey, v: string, single = false): FilterState => {
    const cur = s.facets[key] ?? []
    const next = single ? (cur[0] === v ? [] : [v]) : cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]
    return { ...s, facets: { ...s.facets, [key]: next } }
  }
  const count = filterRecords(records, state).length
  const otherCount = activeFilterCount(state, ["semester", ...primary])
  const mobileCount = activeFilterCount(state, ["semester"])

  const chips = useMemo(() => {
    const out: { key: string; text: string; remove: () => FilterState }[] = []
    for (const key of facets)
      for (const v of state.facets[key] ?? []) out.push({ key: `${key}:${v}`, text: label(key, v), remove: () => toggle(state, key, v) })
    if (state.time) out.push({ key: "time", text: `Thời gian: ${rangeLabel(state.time)}`, remove: () => ({ ...state, time: undefined }) })
    if (state.session) out.push({ key: "session", text: `Buổi ${sessionMeta[state.session].label.toLowerCase()}`, remove: () => ({ ...state, session: undefined }) })
    if (state.schedule) out.push({ key: "schedule", text: state.schedule.length === 2 ? scheduleLabel(state.schedule as SchedulePattern) : `T${state.schedule}`, remove: () => ({ ...state, schedule: undefined }) })
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, facets])

  const saveView = () => {
    const name = chips.map((c) => c.text).join(" · ") || "Tất cả"
    setViews((v) => [...v.filter((x) => x.name !== name), { name, state }])
    toast(`Đã lưu chế độ xem “${name}”`)
  }

  const semesterOptions = decorate("semester", facetOptions(records, state, "semester"))
  const semesterValue = state.facets.semester?.[0]
  const SemesterSwitcher = (
    <Popover label={semesterValue ? label("semester", semesterValue) : "Tất cả học kỳ"} active={Boolean(semesterValue)} width={260}>
      {(close) => (
        <>
          <OptionList single options={semesterOptions} selected={state.facets.semester ?? []} onToggle={(v) => { set(toggle(state, "semester", v, true)); close() }} />
          <button type="button" onClick={() => { set({ ...state, facets: { ...state.facets, semester: [] } }); close() }} className="mt-1 w-full rounded-[6px] px-2 py-2 text-left text-[13px] font-medium text-muted hover:bg-subtle">
            Tất cả học kỳ
          </button>
        </>
      )}
    </Popover>
  )

  const moreMenu = (
    <MoreMenu
      label="Chế độ xem"
      items={[
        { label: "Lưu chế độ xem", icon: <BookmarkPlus size={16} strokeWidth={1.75} />, onSelect: saveView },
        ...views.map((v) => ({ label: v.name, icon: <Bookmark size={16} strokeWidth={1.75} />, onSelect: () => onChange(v.state) })),
      ]}
    />
  )

  const search = (
    <label className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-[8px] border border-line bg-white px-3 focus-within:border-brand lg:min-w-[220px] lg:max-w-[300px]">
      <Search size={17} strokeWidth={1.75} className="shrink-0 text-muted" aria-hidden="true" />
      <input type="search" value={state.q} onChange={(e) => onChange({ ...state, q: e.target.value })} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="min-h-12 min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted" />
    </label>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop toolbar */}
      <div className="hidden flex-wrap items-center gap-2 lg:flex">
        {search}
        {SemesterSwitcher}
        {primary.filter((k) => facets.includes(k)).map((key) => {
          const sel = state.facets[key] ?? []
          return (
            <Popover key={key} label={sel.length ? `${facetTitles[key]} · ${sel.length === 1 ? label(key, sel[0]) : sel.length}` : facetTitles[key]} active={sel.length > 0}>
              {() => <OptionList options={decorate(key, facetOptions(records, state, key))} selected={sel} onToggle={(v) => set(toggle(state, key, v))} searchPlaceholder={`Tìm ${facetTitles[key].toLowerCase()}...`} />}
            </Popover>
          )
        })}
        {(facets.some((k) => !primary.includes(k) && k !== "semester") || time || teaching) && (
          <button
            type="button"
            onClick={() => setDrawer("more")}
            className={`inline-flex min-h-12 items-center gap-1.5 rounded-[8px] border px-3 text-[13px] font-medium ${otherCount ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink"}`}
          >
            <SlidersHorizontal size={15} strokeWidth={1.75} />
            Bộ lọc khác{otherCount ? ` · ${otherCount}` : ""}
          </button>
        )}
        <div className="flex-1" />
        {extra}
        {moreMenu}
      </div>

      {/* Mobile: search + semester + one filter button */}
      <div className="flex flex-col gap-2 lg:hidden">
        {search}
        <div className="flex items-center gap-2">
          {SemesterSwitcher}
          <button
            type="button"
            onClick={() => setDrawer("all")}
            className={`inline-flex min-h-12 items-center gap-1.5 rounded-[8px] border px-3 text-[13px] font-medium ${mobileCount ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink"}`}
          >
            <SlidersHorizontal size={15} strokeWidth={1.75} />
            Bộ lọc{mobileCount ? ` · ${mobileCount}` : ""}
          </button>
          <div className="flex-1" />
          {extra}
          {moreMenu}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0">
          {chips.map((c) => (
            <button key={c.key} type="button" onClick={() => set(c.remove())} className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand/30 bg-brand-soft py-1 pr-2 pl-3 text-[12px] font-medium text-brand">
              {c.text}
              <X size={13} strokeWidth={2} />
            </button>
          ))}
          <button type="button" onClick={() => onChange({ facets: {}, q: state.q })} className="-my-1 shrink-0 px-1 py-3 text-[12px] font-semibold text-muted hover:text-ink">
            Xóa bộ lọc
          </button>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-ink" aria-live="polite">
          {count} {noun}
        </p>
        {sort && (
          <label className="flex items-center gap-1.5 text-[12px] text-muted">
            Sắp xếp
            <select value={sort.value} onChange={(e) => sort.onChange(e.target.value)} className="h-8 rounded-[6px] border border-line bg-white px-2 text-[12px] font-medium text-ink outline-none focus:border-brand">
              {sort.options.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        )}
      </div>

      {drawer && (
        <FilterDrawer
          {...props}
          only={drawer === "more" ? (k) => !primary.includes(k as FacetKey) && k !== "semester" : (k) => k !== "semester"}
          onApply={(s) => {
            set(s)
            setDrawer(null)
          }}
          onClose={() => setDrawer(null)}
          decorate={decorate}
        />
      )}
    </div>
  )
}

type DrawerProps = SmartFilterProps & {
  only: (k: string) => boolean
  onApply: (s: FilterState) => void
  onClose: () => void
  decorate: ReturnType<typeof useFacetLabels>["decorate"]
}

/** Bottom sheet holding a draft; the apply button always shows the live result count. */
function FilterDrawer({ records, state, facets, time, teaching, only, onApply, onClose, decorate }: DrawerProps) {
  const [draft, setDraftRaw] = useState(state)
  const setDraft = (s: FilterState) => setDraftRaw(prune(records, s))
  const results = filterRecords(records, draft).length
  const countPatch = (patch: Partial<FilterState>) => filterRecords(records, { ...draft, ...patch }).length
  const available = (k: string) => only(k) && (k === "time" ? time : k === "session" || k === "schedule" ? teaching : facets.includes(k as FacetKey))
  const toggle = (key: FacetKey, v: string) => {
    const cur = draft.facets[key] ?? []
    setDraft({ ...draft, facets: { ...draft.facets, [key]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] } })
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Bộ lọc"
      description="Các bộ lọc kết hợp với nhau (AND). Chọn nhiều giá trị trong cùng một mục sẽ lấy bất kỳ (OR)."
      footer={
        <>
          <Button variant="secondary" className="w-auto shrink-0 px-4" onClick={() => setDraftRaw({ facets: { semester: draft.facets.semester }, q: draft.q })}>Xóa bộ lọc</Button>
          <Button onClick={() => onApply(draft)} className="whitespace-nowrap px-2">Áp dụng · {results} kết quả</Button>
        </>
      }
    >
      {SECTIONS.map((sec) => {
        const keys = sec.keys.filter(available)
        if (!keys.length) return null
        return (
          <section key={sec.title} className="flex flex-col gap-3 border-b border-line pb-4 last:border-b-0">
            <h3 className="text-[11px] font-semibold tracking-wide text-brand">{sec.title.toUpperCase()}</h3>
            {keys.map((k) => (
              <div key={k} className="flex flex-col gap-2">
                <p className="text-[13px] font-semibold text-ink">
                  {k in timeTitles ? timeTitles[k as keyof typeof timeTitles] : facetTitles[k as FacetKey]}
                  {HIERARCHY.includes(k as FacetKey) && (draft.facets[k as FacetKey]?.length ?? 0) > 0 && <span className="ml-1.5 text-[11px] font-medium text-brand">{draft.facets[k as FacetKey]!.length} đã chọn</span>}
                </p>
                {k === "time" ? (
                  <TimeRangeControl value={draft.time} onChange={(t) => setDraft({ ...draft, time: t })} count={(t) => countPatch({ time: t })} />
                ) : k === "session" ? (
                  <SessionControl value={draft.session} onChange={(v) => setDraft({ ...draft, session: v })} count={(v) => countPatch({ session: v })} />
                ) : k === "schedule" ? (
                  <ScheduleControl value={draft.schedule} onChange={(v) => setDraft({ ...draft, schedule: v })} count={(v) => countPatch({ schedule: v })} />
                ) : (
                  <OptionList variant="chips" options={decorate(k as FacetKey, facetOptions(records, draft, k as FacetKey))} selected={draft.facets[k as FacetKey] ?? []} onToggle={(v) => toggle(k as FacetKey, v)} searchPlaceholder={`Tìm ${facetTitles[k as FacetKey].toLowerCase()}...`} />
                )}
              </div>
            ))}
          </section>
        )
      })}
    </Modal>
  )
}
