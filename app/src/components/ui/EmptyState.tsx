import { Inbox } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-line bg-white px-5 py-9 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        {icon ?? <Inbox size={22} strokeWidth={1.75} />}
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        {description && (
          <p className="text-[13px] leading-[1.5] text-muted">{description}</p>
        )}
      </div>
      {action && <div className="mt-1 flex items-center justify-center">{action}</div>}
    </div>
  )
}
