import type { ReactNode } from "react"
import type { Tone } from "@/types"

export const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  olive: "bg-olive-soft text-olive",
  amber: "bg-amber-soft text-amber",
  rust: "bg-rust-soft text-rust",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-subtle text-muted",
}

export default function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex min-w-0 max-w-full items-center whitespace-normal rounded-[5px] px-2 py-[5px] text-[12px] leading-[1.4] font-medium [overflow-wrap:anywhere] ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}
