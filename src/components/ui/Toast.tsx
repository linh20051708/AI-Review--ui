import { AlertCircle, CircleCheck } from "lucide-react"
import { useSyncExternalStore } from "react"

type Kind = "success" | "error"
interface ToastState {
  text: string
  kind: Kind
}
interface Listener {
  (): void
}

let state: ToastState | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<Listener>()
const subscribe = (l: Listener) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
const emit = (next: ToastState | null) => {
  state = next
  listeners.forEach((l) => l())
}

export function toast(text: string, kind: Kind = "success") {
  emit({ text, kind })
  clearTimeout(timer)
  timer = setTimeout(() => emit(null), 3200)
}

export default function Toaster() {
  const current = useSyncExternalStore<ToastState | null>(subscribe, () => state)
  if (!current) return null
  const isError = current.kind === "error"
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-5 lg:bottom-8">
      <div
        role="status"
        className={`pointer-events-auto flex max-w-[440px] items-center gap-2.5 rounded-[8px] px-4 py-3 text-[14px] leading-[1.45] text-white ${
          isError ? "bg-danger" : "bg-ink"
        }`}
      >
        {isError ? (
          <AlertCircle size={18} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
        ) : (
          <CircleCheck size={18} strokeWidth={1.75} className="shrink-0 text-brand-soft" aria-hidden="true" />
        )}
        <span>{current.text}</span>
        <button
          type="button"
          onClick={() => {
            clearTimeout(timer)
            emit(null)
          }}
          aria-label="Đóng thông báo"
          className="ml-1 flex size-12 shrink-0 items-center justify-center rounded-[6px] text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
