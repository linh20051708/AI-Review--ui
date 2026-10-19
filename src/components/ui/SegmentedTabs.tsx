interface Props {
  tabs: string[]
  active: string
  onChange: (tab: string) => void
}

export default function SegmentedTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none]">
      <div role="tablist" className="flex w-max gap-1 rounded-[8px] bg-subtle p-1">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            role="tab"
            type="button"
            aria-selected={tab === active}
            tabIndex={tab === active ? 0 : -1}
            onClick={() => onChange(tab)}
            onKeyDown={event => {
              let next = index
              if (event.key === "ArrowRight") next = (index + 1) % tabs.length
              else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length
              else if (event.key === "Home") next = 0
              else if (event.key === "End") next = tabs.length - 1
              else return
              event.preventDefault()
              onChange(tabs[next])
              const target = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]
              target?.focus({ preventScroll: true })
              target?.scrollIntoView({ block: "nearest", inline: "nearest" })
            }}
            className={`whitespace-nowrap rounded-[6px] px-3 py-2 text-[13px] font-medium transition ${tab === active ? "bg-white text-brand shadow-[0_1px_2px_rgba(36,51,45,0.08)]" : "text-muted"}`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
}
