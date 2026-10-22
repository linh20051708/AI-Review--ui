import { contentText, shortCriterion } from "@/components/ui/contentText"
import { Check, Plus } from "lucide-react"
import Badge from "@/components/ui/Badge"
import type { AIFinding, AIFindingLevel, Tone } from "@/types"

export const findingLevel: Record<AIFindingLevel, { label: string; tone: Tone }> = {
  error: { label: "Lỗi", tone: "rust" },
  warning: { label: "Cảnh báo", tone: "amber" },
  suggestion: { label: "Gợi ý", tone: "olive" },
}

interface Props {
  finding: AIFinding
  added?: boolean
  onAdd?: () => void
}

export default function AIFindingCard({ finding, added, onAdd }: Props) {
  const meta = findingLevel[finding.level]
  return (
    <div className="flex flex-col gap-2 rounded-[8px] border border-line bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={meta.tone}>{meta.label}</Badge>
        <Badge>{shortCriterion(finding.category)}</Badge>
        {finding.maxScore !== undefined && <span className="text-[14px] font-semibold">{finding.proposedScore ?? "—"}/{finding.maxScore}</span>}{finding.pageRef && <span className="ml-auto text-[14px] text-muted">{finding.pageRef}</span>}
      </div>
      <p className="text-[14px] leading-[1.45] text-ink">{contentText(finding.message)}</p>
      {finding.issue && <p className="text-[14px]">{finding.issue}</p>}
      {finding.suggestion && <p className="text-[14px] text-brand">{finding.suggestion}</p>}
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          className="inline-flex min-h-12 min-w-12 items-center gap-1 self-start text-[14px] font-semibold text-brand disabled:text-muted"
        >
          {added ? <Check size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
          {added ? "Đã thêm vào phản hồi" : "Thêm vào phản hồi"}
        </button>
      )}
    </div>
  )
}

