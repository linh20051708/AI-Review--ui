import { Eye, FileText, Lock } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import MetaGrid from "@/components/ui/MetaGrid"
import StatusBadge from "@/components/ui/StatusBadge"
import { aiSummary } from "@/data/mockData"
import type { DocumentVersion } from "@/types"

interface Props {
  version: DocumentVersion
  selected?: boolean
  onView: () => void
  onCompare?: () => void
}

/** Read-only snapshot of one submitted version. No edit / replace / delete. */
export default function VersionCard({ version, selected, onView, onCompare }: Props) {
  return (
    <Card tinted={version.isCurrent} className={selected ? "border-brand" : version.isCurrent ? "border-brand/30" : ""}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-[17px] font-semibold text-ink">
          {version.version}
          {version.isCurrent && <Badge tone="brand">Version mới nhất</Badge>}
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] text-muted"><Lock size={12} strokeWidth={2} />Bất biến</span>
      </div>
      <div className="flex items-center gap-2 text-[12px] text-muted">
        <FileText size={14} strokeWidth={1.75} />
        <span className="truncate">{version.fileName}</span>
      </div>
      <MetaGrid items={[{ label: "Người nộp", value: version.submitter }, { label: "Ngày nộp", value: version.submittedAt }]} />
      <dl className="flex flex-col gap-2 text-[12px]">
        <div className="flex items-center justify-between gap-2"><dt className="text-muted">Tài liệu</dt><dd><StatusBadge status={version.documentStatus} /></dd></div>
        <div className="flex items-center justify-between gap-2"><dt className="text-muted">AI Review</dt><dd><Badge tone={version.ai.errors ? "rust" : "olive"}>{aiSummary(version.ai)}</Badge></dd></div>
        <div className="flex items-center justify-between gap-2"><dt className="text-muted">Giảng viên</dt><dd><StatusBadge status={version.supervisorStatus} /></dd></div>
        <div className="flex items-center justify-between gap-2"><dt className="text-muted">Feedback</dt><dd className="font-semibold text-ink">{version.feedbackCount} feedback</dd></div>
      </dl>
      {version.summary && <p className="text-[12px] leading-[1.45] text-muted">{version.summary}</p>}
      <div className="flex gap-4">
        <button type="button" onClick={onView} className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand"><Eye size={14} strokeWidth={1.75} />Xem version</button>
        {onCompare && <button type="button" onClick={onCompare} className="text-[12px] font-semibold text-brand">So sánh với version trước</button>}
      </div>
    </Card>
  )
}
