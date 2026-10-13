import { Lock } from "lucide-react"
import { useState } from "react"
import Badge from "@/components/ui/Badge"
import { TextArea } from "@/components/ui/Form"
import { currentUser } from "@/data/mockData"
import { reviewActions } from "@/data/reviewStore"
import type { ReviewFeedback } from "@/types"
import { severityTone } from "./severity"


export default function FeedbackItem({ feedback }: { feedback: ReviewFeedback }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(feedback.message)
  // Only the author's own feedback that is not yet part of an official review decision can change.
  const editable = !feedback.official && feedback.author === currentUser.name

  return (
    <div className="flex flex-col gap-2 rounded-[8px] border border-line bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        {feedback.pageRef && <Badge tone="brand">{feedback.pageRef}</Badge>}
        <Badge tone={severityTone[feedback.severity]}>{feedback.severity}</Badge>
        <Badge>{feedback.category}</Badge>
      </div>
      {editing ? (
        <>
          <TextArea rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-label="Nội dung feedback" />
          <div className="flex gap-3">
            <button
              type="button"
              className="text-[12px] font-semibold text-brand"
              onClick={() => {
                if (text.trim()) reviewActions.updateFeedback(feedback.id, text.trim())
                setEditing(false)
              }}
            >
              Lưu
            </button>
            <button type="button" className="text-[12px] font-semibold text-muted" onClick={() => setEditing(false)}>
              Hủy
            </button>
          </div>
        </>
      ) : (
        <p className="text-[13px] leading-[1.45] text-ink">“{feedback.message}”</p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
        <span>{feedback.author}</span>
        <span>{feedback.createdAt}</span>
        <span>Version {feedback.version}</span>
        {feedback.official ? (
          <span className="ml-auto inline-flex items-center gap-1"><Lock size={11} strokeWidth={2} />Thuộc lịch sử review</span>
        ) : (
          editable &&
          !editing && (
            <span className="ml-auto flex gap-3">
              <button type="button" className="font-semibold text-brand" onClick={() => setEditing(true)}>Sửa</button>
              <button type="button" className="font-semibold text-muted" onClick={() => reviewActions.removeDraftFeedback(feedback.id)}>Bỏ nháp</button>
            </span>
          )
        )}
      </div>
    </div>
  )
}
