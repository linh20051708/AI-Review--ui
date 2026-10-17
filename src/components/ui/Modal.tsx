import { X } from "lucide-react"
import { useEffect, useRef, type ReactNode } from "react"

interface Props {
  open: boolean
  title: string
  description?: ReactNode
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Bottom sheet on mobile, centered dialog on desktop. */
export default function Modal({ open, title, description, onClose, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  // Focus containment (WCAG 2.4.3) and focus restoration (WCAG 2.1.1).
  useEffect(() => {
    if (!open) return
    restoreRef.current = document.activeElement as HTMLElement | null
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panelRef.current)?.focus({ preventScroll: true })
    return () => restoreRef.current?.focus({ preventScroll: true })
  }, [open])

  // Keep Tab cycling inside the dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panelRef.current) return
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panelRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="safe-bottom flex max-h-[92dvh] w-full max-w-[520px] flex-col rounded-t-[12px] bg-white sm:rounded-[12px]"
      >
        <div className="flex items-start gap-3 border-b border-line px-5 pt-4 pb-3 sm:pt-5 sm:pb-4">
          <div className="min-w-0 flex-1 leading-[1.45]">
            <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
            {description && <div className="mt-1 text-[14px] text-muted">{description}</div>}
          </div>
          {/* Minimum 48x48 dp touch target for close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="-mr-2 flex size-12 items-center justify-center rounded-[8px] text-muted hover:bg-subtle active:scale-95 transition"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
