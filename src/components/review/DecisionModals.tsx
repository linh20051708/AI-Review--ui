import { AlertTriangle, Info } from "lucide-react"
import { useState, type ReactNode } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { ChoiceChips, Field, Select, TextArea } from "@/components/ui/Form"
import MetaGrid from "@/components/ui/MetaGrid"
import Modal from "@/components/ui/Modal"
import { toast } from "@/components/ui/Toast"
import { feedbackCategories } from "@/data/mockData"
import { reviewActions } from "@/data/reviewStore"
import type { FeedbackSeverity, ReviewFeedback, ReviewRequest } from "@/types"
import { severityTone } from "./severity"

export type Decision = "approve" | "revise" | "reject"

interface Props {
  review: ReviewRequest
  open: Decision | null
  currentFeedback: ReviewFeedback[]
  onClose: () => void
}

const Callout = ({ tone, children }: { tone: "info" | "warn"; children: ReactNode }) => (
  <div className={`flex gap-2.5 rounded-[8px] p-3 text-[12px] leading-[1.45] ${tone === "warn" ? "bg-rust-soft text-rust" : "bg-brand-tint text-ink"}`}>
    {tone === "warn" ? <AlertTriangle size={16} strokeWidth={1.75} className="mt-px shrink-0" /> : <Info size={16} strokeWidth={1.75} className="mt-px shrink-0 text-brand" />}
    <p>{children}</p>
  </div>
)

const rejectReasons = ["Sai loại tài liệu", "File không hợp lệ", "Nội dung không đúng yêu cầu", "Không thể review", "Khác"]

export default function DecisionModals({ review, open, currentFeedback, onClose }: Props) {
  const label = `${review.documentTitle} ${review.version}`
  const context = [
    { label: "Project", value: review.projectName },
    { label: "Nhóm", value: `${review.classCode} · ${review.groupName}` },
    { label: "Tài liệu", value: review.documentTitle },
    { label: "Version", value: review.version },
  ]

  // Revision
  const [summary, setSummary] = useState("")
  const [severity, setSeverity] = useState<FeedbackSeverity>("Major")
  const [category, setCategory] = useState(feedbackCategories[1])
  const [included, setIncluded] = useState<string[] | null>(null)
  const includedIds = included ?? currentFeedback.map((f) => f.id)

  // Not accepted
  const [reason, setReason] = useState("")
  const [reasonNote, setReasonNote] = useState("")

  const close = () => {
    setSummary("")
    setIncluded(null)
    setReason("")
    setReasonNote("")
    onClose()
  }

  return (
    <>
      <Modal
        open={open === "approve"}
        onClose={close}
        title="Phê duyệt tài liệu"
        description={`Bạn xác nhận phê duyệt ${label}?`}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Hủy</Button>
            <Button
              onClick={() => {
                reviewActions.decide(review.id, "approved")
                toast(`Đã phê duyệt ${label}`)
                close()
              }}
            >
              Xác nhận phê duyệt
            </Button>
          </>
        }
      >
        <MetaGrid items={context} />
        <Callout tone="info">Sau khi phê duyệt, trạng thái tài liệu sẽ được cập nhật và các dependency liên quan có thể được mở.</Callout>
      </Modal>

      <Modal
        open={open === "revise"}
        onClose={close}
        title="Yêu cầu chỉnh sửa"
        description="Ghi rõ các nội dung sinh viên cần cập nhật trước khi nộp version mới."
        footer={
          <>
            <Button variant="secondary" onClick={close}>Hủy</Button>
            <Button
              disabled={!summary.trim()}
              className="disabled:opacity-50"
              onClick={() => {
                reviewActions.addFeedback({ reviewId: review.id, version: review.version, severity, category, message: summary.trim() })
                reviewActions.decide(review.id, "needsRevision", `${summary.trim()} (${includedIds.length} feedback đính kèm)`)
                toast(`Đã gửi yêu cầu chỉnh sửa ${label}`)
                close()
              }}
            >
              Gửi yêu cầu chỉnh sửa
            </Button>
          </>
        }
      >
        <MetaGrid items={context} />
        <Field label="Feedback tổng quan" required>
          <TextArea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={`${review.documentTitle} cần cập nhật các relationship và bổ sung missing Actor trước khi nộp lại.`} />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Mức độ">
            <ChoiceChips<FeedbackSeverity> options={["Minor", "Major", "Critical"]} value={severity} onChange={setSeverity} />
          </Field>
          <Field label="Category">
            <Select options={feedbackCategories} value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
        </div>
        {currentFeedback.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1.5 text-[13px] font-semibold text-ink">Feedback đính kèm ({includedIds.length}/{currentFeedback.length})</legend>
            {currentFeedback.map((f) => (
              <label key={f.id} className="flex items-start gap-2.5 rounded-[8px] border border-line p-2.5 text-[12px] leading-[1.45]">
                <input
                  type="checkbox"
                  className="mt-0.5 accent-[#146b55]"
                  checked={includedIds.includes(f.id)}
                  onChange={(e) => setIncluded(e.target.checked ? [...includedIds, f.id] : includedIds.filter((id) => id !== f.id))}
                />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="flex flex-wrap gap-1.5">
                    {f.pageRef && <Badge tone="brand">{f.pageRef}</Badge>}
                    <Badge tone={severityTone[f.severity]}>{f.severity}</Badge>
                  </span>
                  <span className="text-ink">{f.message}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <Callout tone="info">Sinh viên sẽ phải tạo version mới để nộp lại. Version hiện tại sẽ được giữ nguyên trong lịch sử.</Callout>
      </Modal>

      <Modal
        open={open === "reject"}
        onClose={close}
        title="Đánh dấu tài liệu không đạt"
        description={`${label} · ${review.projectName}`}
        footer={
          <>
            <Button variant="secondary" onClick={close}>Hủy</Button>
            <Button
              disabled={!reason || (reason === "Khác" && !reasonNote.trim())}
              className="!border-danger !bg-danger text-white disabled:opacity-50"
              onClick={() => {
                reviewActions.decide(review.id, "notAccepted", [reason, reasonNote.trim()].filter(Boolean).join(" · "))
                toast(`Đã đánh dấu ${label} không đạt`)
                close()
              }}
            >
              Xác nhận không đạt
            </Button>
          </>
        }
      >
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[13px] font-semibold text-ink">
            Lý do <span className="text-danger">*</span>
          </legend>
          {rejectReasons.map((r) => (
            <label key={r} className={`flex items-center gap-2.5 rounded-[8px] border p-3 text-[13px] ${reason === r ? "border-brand bg-brand-tint" : "border-line"}`}>
              <input type="radio" name="reject-reason" className="accent-[#146b55]" checked={reason === r} onChange={() => setReason(r)} />
              {r}
            </label>
          ))}
        </fieldset>
        <Field label="Ghi chú" required={reason === "Khác"}>
          <TextArea rows={3} value={reasonNote} onChange={(e) => setReasonNote(e.target.value)} placeholder="Ví dụ: File nộp là biên bản họp nhóm, không phải Use Case Diagram." />
        </Field>
        <Callout tone="warn">Thao tác này không dùng cho các lỗi có thể chỉnh sửa thông thường. Với các lỗi cần sinh viên cập nhật tài liệu, hãy sử dụng ‘Yêu cầu chỉnh sửa’.</Callout>
      </Modal>
    </>
  )
}
