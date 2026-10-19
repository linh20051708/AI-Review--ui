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

/** Bottom sheet on mobile, centered dialog on desktop. */
export default function Modal({ open, title, description, onClose, children, footer }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return
    const opener = document.activeElement as HTMLElement | null
    const panes = [...document.querySelectorAll<HTMLElement>(".mobile-content")]
    const previous = panes.map(pane => pane.style.overflow)
    panes.forEach(pane => { pane.style.overflow = "hidden" })
    const topmost = () => !document.querySelector("dialog[open]") &&
      [...document.querySelectorAll('[role="dialog"][aria-modal="true"]')].at(-1) === panel
    const focusable = () => [...panel.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]')]
      .filter(el => el.getClientRects().length && !el.closest('[hidden]') &&
        (!el.closest('details:not([open])') || el.tagName === "SUMMARY"))
    panel.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => {
      if (!topmost()) return
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeRef.current(); return }
      if (e.key !== "Tab") return
      const items = focusable()
      const first = items[0], last = items.at(-1)
      if (!first) { e.preventDefault(); panel.focus(); return }
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault(); last?.focus()
      } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel)) {
        e.preventDefault(); first.focus()
      }
    }
    const containFocus = (e: FocusEvent) => {
      if (topmost() && !panel.contains(e.target as Node)) panel.focus({ preventScroll: true })
    }
    window.addEventListener("keydown", onKey)
    document.addEventListener("focusin", containFocus)
    return () => {
      window.removeEventListener("keydown", onKey)
      document.removeEventListener("focusin", containFocus)
      panes.forEach((pane, i) => { pane.style.overflow = previous[i] })
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
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
        tabIndex={-1}
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="safe-bottom flex max-h-[92dvh] w-full max-w-[520px] flex-col rounded-t-[16px] bg-white sm:rounded-[14px]"
      >
        <div className="flex items-start gap-3 border-b border-line px-5 pt-4 pb-3 sm:pt-5 sm:pb-4">
          <div className="min-w-0 flex-1 leading-[1.45]">
            <h2 className="text-[18px] font-semibold text-ink">{title}</h2>
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
