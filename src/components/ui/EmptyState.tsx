import { Inbox } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  headingLevel?: 2 | 3
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  headingLevel = 3,
}: EmptyStateProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3"
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-line bg-white px-5 py-9 text-center">
      <div aria-hidden="true" className="flex size-[34px] items-center justify-center rounded-[8px] bg-brand-soft text-brand">
        {icon ?? <Inbox size={18} strokeWidth={1.75} />}
      </div>
      <div className="flex flex-col gap-1 max-w-sm">
        <Heading className="text-[15px] font-semibold text-ink">{title}</Heading>
        {description && (
          <p className="text-[13px] leading-[1.5] text-muted">{description}</p>
        )}
      </div>
      {action && <div className="mt-1 flex items-center justify-center">{action}</div>}
    </div>
  )
}
