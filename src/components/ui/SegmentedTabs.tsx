import { useRef } from "react"

interface Props {
  id?: string
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export default function SegmentedTabs({ id, tabs, active, onChange }: Props) {
  const listRef = useRef<HTMLDivElement>(null)

  const focusTab = (tab: string) => {
    const el = listRef.current?.querySelector<HTMLButtonElement>(
      `[data-tab="${CSS.escape(tab)}"]`,
    )
    el?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const index = tabs.indexOf(active)
    let next: number | null = null
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = tabs.length - 1
    if (next === null) return
    e.preventDefault()
    onChange(tabs[next])
    focusTab(tabs[next])
  }

  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none]">
      <div
        ref={listRef}
        role="tablist"
        className="flex w-max gap-1 rounded-[8px] bg-subtle p-1"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            data-tab={tab}
            role="tab"
            type="button"
            id={id ? `${id}-tab-${tab}` : undefined}
            aria-controls={id ? `${id}-tabpanel` : undefined}
            aria-selected={tab === active}
            tabIndex={tab === active ? 0 : -1}
            onClick={() => onChange(tab)}
            className={`whitespace-nowrap rounded-[6px] px-3 py-2 text-[13px] font-medium transition ${tab === active ? "bg-white text-brand" : "text-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
