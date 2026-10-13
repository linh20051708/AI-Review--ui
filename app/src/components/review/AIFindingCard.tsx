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
        <Badge>{finding.category}</Badge>
        {finding.pageRef && <span className="ml-auto text-[11px] text-muted">{finding.pageRef}</span>}
      </div>
      <p className="text-[13px] leading-[1.45] text-ink">{finding.message}</p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          disabled={added}
          className="inline-flex items-center gap-1 self-start text-[12px] font-semibold text-brand disabled:text-muted"
        >
          {added ? <Check size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
          {added ? "Đã thêm vào feedback" : "Thêm vào feedback"}
        </button>
      )}
    </div>
  )
}
