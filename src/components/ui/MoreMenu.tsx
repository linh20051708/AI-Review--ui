import { MoreHorizontal } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

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
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  return (
    <div ref={ref} className="relative">
      {/* 48x48 dp touch target */}
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-12 items-center justify-center rounded-[8px] border border-line bg-white text-ink hover:bg-subtle active:scale-95 transition"
      >
        <MoreHorizontal size={20} strokeWidth={1.75} />
      </button>
      {open && (
        <ul
          role="menu"
          className={`absolute z-30 min-w-[210px] rounded-[10px] border border-line bg-white p-1.5 shadow-[0_8px_24px_rgba(36,51,45,0.12)] ${
            align === "right" ? "right-0" : "left-0"
          } ${up ? "bottom-full mb-2" : "top-full mt-2"}`}
        >
          {items.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false)
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
