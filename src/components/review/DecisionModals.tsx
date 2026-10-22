import { useState } from "react"
import Button from "@/components/ui/Button"
import { Field, TextArea, Select } from "@/components/ui/Form"
import MetaGrid from "@/components/ui/MetaGrid"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import { toast } from "@/components/ui/Toast"
import { feedbackCategories } from "@/data/mockData"
import { reviewActions, supervisorBlock } from "@/data/reviewStore"
import type { FeedbackSeverity, ReviewFeedback, ReviewRequest } from "@/types"
export type Decision = "approve" | "revise" | "reject"
export default function DecisionModals({
  review,
  open,
  currentFeedback,
  onClose,
}: {
  review: ReviewRequest
  open: Decision | null
  currentFeedback: ReviewFeedback[]
  onClose: () => void
}) {
  const [summary, setSummary] = useState("")
  const [reason, setReason] = useState("")
  const [included, setIncluded] = useState<string[] | null>(null)
  const [error, setError] = useState("")
  const [severity, setSeverity] = useState<FeedbackSeverity>("Major")
  const [category, setCategory] = useState(feedbackCategories[1])
  const ids =
    included ?? currentFeedback.filter((f) => !f.official).map((f) => f.id)
  const close = () => {
    setSummary("")
    setReason("")
    setIncluded(null)
    setError("")
    onClose()
  }
  const title =
    open === "approve"
      ? "Phê duyệt tài liệu"
      : open === "revise"
        ? "Yêu cầu chỉnh sửa"
        : "Đánh dấu tài liệu không đạt"
  const blocked = supervisorBlock(review)
  const invalid = Boolean(
    blocked ||
      (open === "revise" && !summary.trim()) ||
      (open === "reject" &&
        (!reason || (reason === "Khác" && !summary.trim()))),
  )
  const confirm = () => {
    try {
      if (blocked) throw new Error(blocked)
      const selected = [...ids]
      if (open === "revise")
        selected.push(
          reviewActions.addFeedback({
            reviewId: review.id,
            version: review.version,
            severity,
            category,
            message: summary.trim(),
          }),
        )
      const note =
        open === "reject"
          ? [reason, summary.trim()].filter(Boolean).join(" · ")
          : summary.trim()
      reviewActions.decide(
        review.id,
        open === "approve"
          ? "approved"
          : open === "revise"
            ? "needsRevision"
            : "notAccepted",
        note || undefined,
        selected,
      )
      toast("Đã ghi nhận quyết định và phản hồi được chọn")
      close()
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return (
    <Modal
      open={Boolean(open)}
      title={title}
      onClose={close}
      description={review.documentTitle + " · " + review.version}
      footer={
        <>
          <Button variant="secondary" onClick={close}>
            Hủy
          </Button>
          <Button disabled={invalid} onClick={confirm}>
            Xác nhận quyết định
          </Button>
        </>
      }
    >
      <MetaGrid
        items={[
          { label: "Dự án", value: review.projectName },
          { label: "Nhóm", value: review.groupName },
          { label: "Tài liệu", value: review.documentTitle },
          { label: "Phiên bản", value: review.version },
        ]}
      />
      {open === "reject" && (
        <Field label="Lý do" required>
          <Select
            options={[
              "",
              "Sai loại tài liệu",
              "Tệp không hợp lệ",
              "Nội dung không đúng yêu cầu",
              "Không thể đánh giá",
              "Khác",
            ]}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
      )}
      <Field
        label={open === "revise" ? "Phản hồi tổng quan" : "Ghi chú"}
        required={open === "revise" || reason === "Khác"}
      >
        <TextArea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </Field>
      {open === "revise" && (
        <>
          <Field label="Mức độ">
            <Select
              options={["Minor", "Major", "Critical"]}
              value={severity}
              onChange={(e) => setSeverity(e.target.value as FeedbackSeverity)}
            />
          </Field>
          <Field label="Phân loại">
            <Select
              options={feedbackCategories}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Field>
        </>
      )}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-[14px] font-semibold">
          Phản hồi đưa vào quyết định ({ids.length})
        </legend>
        {currentFeedback
          .filter((f) => !f.official)
          .map((f) => (
            <label
              key={f.id}
              className="flex min-h-12 gap-3 rounded-lg border border-line p-3 text-[14px]"
            >
              <input
                type="checkbox"
                className="mt-1 size-5 shrink-0 accent-[#146b55]"
                checked={ids.includes(f.id)}
                onChange={(e) =>
                  setIncluded(
                    e.target.checked
                      ? [...ids, f.id]
                      : ids.filter((id) => id !== f.id),
                  )
                }
              />
              <span>{f.message}</span>
            </label>
          ))}
      </fieldset>
      <Notice>
        Chỉ phản hồi được chọn và phản hồi tổng quan của yêu cầu chỉnh sửa được
        công bố. Phản hồi bỏ chọn vẫn là bản nháp, không hiển thị cho Sinh viên.
        AI không thay Giảng viên xác nhận.
      </Notice>
      {(error || blocked) && (
        <p role="alert" className="text-[14px] text-danger">
          {error || blocked}
        </p>
      )}
    </Modal>
  )
}
