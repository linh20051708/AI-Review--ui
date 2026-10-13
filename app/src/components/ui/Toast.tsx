import { CircleCheck } from "lucide-react"
import { useSyncExternalStore } from "react"

let message: string | null = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function toast(text: string) {
  message = text
  listeners.forEach((l) => l())
  clearTimeout(timer)
  timer = setTimeout(() => {
    message = null
    listeners.forEach((l) => l())
  }, 3200)
}

export default function Toaster() {
  const text = useSyncExternalStore(subscribe, () => message)
  if (!text) return null
  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-5 lg:bottom-8">
      <div className="flex max-w-[440px] items-center gap-2.5 rounded-[10px] bg-ink px-4 py-3 text-[13px] leading-[1.45] text-white shadow-[0_6px_20px_rgba(36,51,45,0.18)]">
        <CircleCheck size={18} strokeWidth={1.75} className="shrink-0 text-brand-soft" />
        {text}
      </div>
    </div>
  )
}
