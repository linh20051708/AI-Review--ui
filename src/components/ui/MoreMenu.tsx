import { MoreHorizontal } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"

interface Item {
  label: string
  icon?: ReactNode
  danger?: boolean
  onSelect: () => void
}

export default function MoreMenu({
  items,
  label = "Thêm thao tác",
  align = "right",
  up,
}: {
  items: Item[]
  label?: string
  align?: "left" | "right"
  up?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: MouseEvent) => !containerRef.current?.contains(e.target as Node) && close()
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [open, close])

  useEffect(() => {
    if (open) setActiveIndex(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitem']")[activeIndex]?.focus()
  }, [open, activeIndex])

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const last = items.length - 1
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i >= last ? 0 : i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? last : i - 1))
    } else if (e.key === "Home") {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === "End") {
      e.preventDefault()
      setActiveIndex(last)
    } else if (e.key === "Escape") {
      e.preventDefault()
      close()
      triggerRef.current?.focus()
    } else if (e.key === "Tab") {
      e.preventDefault()
      close()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="flex size-12 items-center justify-center rounded-[8px] border border-line bg-white text-ink hover:bg-subtle active:scale-95 transition"
      >
        <MoreHorizontal size={20} strokeWidth={1.75} />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={`absolute z-30 min-w-[210px] rounded-[10px] border border-line bg-white p-1.5 shadow-[0_8px_24px_rgba(36,51,45,0.12)] ${
            align === "right" ? "right-0" : "left-0"
          } ${up ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {items.map((item, index) => (
            <li key={item.label}>
              <button
                type="button"
                role="menuitem"
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => {
                  close()
                  item.onSelect()
                }}
                className={`flex min-h-[44px] w-full items-center gap-2.5 rounded-[6px] px-3 py-2 text-left text-[14px] font-medium transition hover:bg-subtle ${
                  item.danger ? "text-danger" : "text-ink"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
