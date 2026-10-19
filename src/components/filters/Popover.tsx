import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

interface Props {
  label: ReactNode
  active?: boolean
  children: (close: () => void) => ReactNode
  width?: number
  align?: "left" | "right"
  icon?: ReactNode
}

export default function Popover({ label, active, children, width = 280, align = "left", icon }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.preventDefault(); e.stopPropagation(); setOpen(false); triggerRef.current?.focus()
    }
    document.addEventListener("mousedown", close)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", close)
      document.removeEventListener("keydown", esc)
    }
  }, [open])
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-[8px] border px-3 text-[13px] font-medium transition ${active ? "border-brand bg-brand-soft text-brand" : "border-line bg-white text-ink hover:border-brand/40"}`}
      >
        {icon}
        {label}
        <ChevronDown size={15} strokeWidth={1.75} className={open ? "rotate-180" : ""} />
      </button>
      {open && (
        <div
          className={`absolute top-full z-40 mt-1.5 max-h-[420px] overflow-y-auto rounded-[10px] border border-line bg-white p-2 ${align === "right" ? "right-0" : "left-0"}`}
          style={{ width }}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
