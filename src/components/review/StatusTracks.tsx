import Badge from "@/components/ui/Badge"
import type { ReactNode } from "react"
import StatusBadge from "@/components/ui/StatusBadge"
import { aiSummary } from "@/data/mockData"
import type { AICounts, AIStatus, DocumentStatus, SupervisorStatus } from "@/types"

interface Props {
  documentStatus: DocumentStatus
  aiStatus?: AIStatus
  ai?: AICounts
  supervisorStatus?: SupervisorStatus
  compact?: boolean
  aiContent?: ReactNode
}

/** Document, AI Review and Supervisor Review are separate tracks — never one combined status. */
export default function StatusTracks({ documentStatus, aiStatus, ai, supervisorStatus, compact, aiContent }: Props) {
  const aiBadge =
    aiStatus === "aiReviewing" ? <StatusBadge status="aiReviewing" /> : aiStatus === "notRun" || !ai ? <Badge>Chưa chạy</Badge> : <Badge tone={ai.errors ? "rust" : "olive"}>Đề xuất · Chưa xác minh · {aiSummary(ai)}</Badge>
  const rows = [
    { label: "Tài liệu", node: <StatusBadge status={documentStatus} /> },
    { label: "AI đề xuất", node: aiContent ?? aiBadge },
    { label: "Giảng viên", node: supervisorStatus ? <StatusBadge status={supervisorStatus} /> : <Badge>Chưa có yêu cầu</Badge> },
  ]
  return (
    <dl className={`grid gap-2 text-[12px] leading-[1.45] ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}>
      {rows.map((r) => (
        <div key={r.label} className={`flex min-w-0 items-center justify-between gap-2 ${compact ? "" : "sm:flex-col sm:items-start sm:justify-start"}`}>
          <dt className="text-muted">{r.label}</dt>
          <dd className="min-w-0">{r.node}</dd>
        </div>
      ))}
    </dl>
  )
}
