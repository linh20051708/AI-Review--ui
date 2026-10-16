import { ShieldCheck, Upload } from "lucide-react"

import { useState, type ChangeEvent } from "react"

import { useNavigate, useParams } from "react-router-dom"

import BackLink from "@/components/ui/BackLink"

import Button from "@/components/ui/Button"

import Card from "@/components/ui/Card"

import ConfirmModal from "@/components/ui/ConfirmModal"

import EmptyState from "@/components/ui/EmptyState"

import { Field, TextArea } from "@/components/ui/Form"

import MetaGrid from "@/components/ui/MetaGrid"

import Notice from "@/components/ui/Notice"

import PageHeading from "@/components/ui/PageHeading"

import { toast } from "@/components/ui/Toast"

import { demoStudentId } from "@/data/mockData"

import { useManagement } from "@/data/managementStore"

import { reviewActions } from "@/data/reviewStore"

import { resolveRuleSet } from "@/lib/config"

import { fmtDate } from "@/lib/time"

import type { FileType, ReviewRequest } from "@/types"

import { useStudentContext } from "./useStudentContext"

const nowStr = () => {
  const d = new Date()

  const p = (n: number) => String(n).padStart(2, "0")

  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function StudentUploadPage() {
  const { documentId } = useParams()

  const navigate = useNavigate()

  const ctx = useStudentContext()

  const { ruleSets, students } = useManagement()

  const doc = ctx.docById(documentId)

  const student = students.find((s) => s.id === demoStudentId)

  const [file, setFile] = useState<File | null>(null)

  const [note, setNote] = useState("")

  const [error, setError] = useState("")

  const [pending, setPending] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  if (!doc) return <EmptyState title="Không tìm thấy tài liệu" />

  const request = ctx.requestFor(doc.reviewId)

  const item = doc.lab.items.find((i) => i.id === doc.id)

  const inheritedRule = resolveRuleSet(ctx.cls, ctx.offering, ruleSets)

  const rule = item?.ruleSetId
    ? { value: ruleSets.find((r) => r.id === item.ruleSetId) }
    : inheritedRule

  const maxSizeMB = rule.value?.maxFileSizeMB ?? 20

  const maxBytes = maxSizeMB * 1024 * 1024

  const allowed = (
    item?.allowedFiles === "Both"
      ? ["pdf", "docx"]
      : [item?.allowedFiles.toLowerCase() ?? "pdf"]
  ).filter(
    (ext) =>
      !rule.value ||
      rule.value.allowedFormats.some((f) => f.toLowerCase() === ext),
  )

  const baseNumber = request
    ? Number(request.version.replace(/\D/g, "") || 0)
    : doc.latestVersion
      ? Number(doc.latestVersion.replace(/\D/g, "") || 0)
      : 0

  const nextVersion = `v${baseNumber + 1}`

  const locked = Boolean(doc.submissionLocked)

  const approved = doc.supervisorStatus === "approved"

  const rejected = doc.supervisorStatus === "notAccepted"

  const awaiting =
    request?.supervisorStatus === "waiting" ||
    request?.supervisorStatus === "inReview"

  const dl = ctx.deadlineFor(doc.id)

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null

    setError("")

    setFile(null)

    if (!f) return

    const ext = f.name.split(".").pop()?.toLowerCase() ?? ""

    if (!allowed.includes(ext)) {
      setError(
        `Chỉ chấp nhận file ${allowed.join(", ").toUpperCase() || "theo cấu hình (hiện chưa có loại hợp lệ)"}.`,
      )

      return
    }

    if (!f.size) {
      setError("File rỗng. Vui lòng chọn tài liệu có nội dung.")
      return
    }

    if (f.size > maxBytes) {
      setError(`File vượt quá dung lượng cho phép (${maxSizeMB} MB).`)

      return
    }

    setFile(f)
  }

  const submit = () => {
    if (
      !file ||
      !student ||
      submitting ||
      locked ||
      approved ||
      rejected ||
      awaiting
    )
      return

    setSubmitting(true)

    window.setTimeout(() => {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf"

        const fileType: FileType = ext === "docx" ? "DOCX" : "PDF"

        const pageCount = Math.max(
          4,
          Math.min(20, Math.round(file.size / 120_000) + 6),
        )

        if (request) {
          reviewActions.submitVersion({
            reviewId: request.id,

            version: nextVersion,

            fileName: file.name,

            fileType,

            fileSize: file.size,

            pageCount,

            note: note.trim() || undefined,

            submitter: student.name,
          })
        } else {
          const review: ReviewRequest = {
            id: `review-${Date.now()}`,

            projectId: doc.projectId,

            documentId: doc.id,

            semesterId: ctx.semester!.id,

            courseId: ctx.course!.id,

            classId: ctx.cls!.id,

            groupId: ctx.group!.id,

            classCode: ctx.cls!.code,

            groupName: ctx.group!.name,

            projectName: ctx.project!.name,

            requestedTs: Date.now(),

            fileName: file.name,

            fileType,

            pageCount,

            documentTitle: doc.title,

            version: nextVersion,

            submitter: student.name,

            submittedAt: nowStr(),

            requestedAt: nowStr(),

            documentStatus: nextVersion === "v1" ? "submitted" : "resubmitted",

            aiStatus: "aiReviewed",

            ai: { errors: 1, warnings: 2, suggestions: 1 },

            supervisorStatus: "waiting",

            note: note.trim() || undefined,
          }

          reviewActions.submitFirstVersion({
            review,
            version: nextVersion,
            fileName: file.name,
            fileType,
            fileSize: file.size,
            pageCount,
          })
        }

        toast(
          `Đã nộp ${file.name} (${nextVersion}). Đang chờ giảng viên review.`,
        )

        navigate(`/student/documents/${doc.id}`, { replace: true })
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Không thể nộp tài liệu. Vui lòng thử lại.",
        )
      } finally {
        setSubmitting(false)
      }
    }, 1200)
  }

  return (
    <>
      <BackLink label={doc.title} fallback={`/student/documents/${doc.id}`} />
      <PageHeading
        eyebrow={`NỘP TÀI LIỆU · ${doc.labCode ?? ""}`}
        title={doc.title}
        description={
          request
            ? `Nộp ${nextVersion} sau khi giảng viên yêu cầu chỉnh sửa ${request.version}.`
            : `Bản nộp đầu tiên · ${nextVersion}.`
        }
      />

      {awaiting && (
        <Notice>
          Tài liệu đang chờ review. Không thể gửi thêm yêu cầu hoặc phiên bản
          cho đến khi giảng viên yêu cầu chỉnh sửa.
        </Notice>
      )}

      {locked && (
        <Card>
          <EmptyState
            icon={<ShieldCheck size={24} className="text-brand" />}
            title="Tài liệu đang bị khóa"
            description={`Bạn cần hoàn thành tài liệu trước đó để tiếp tục: ${doc.dependsOn ?? "tài liệu phụ thuộc chưa được phê duyệt."}`}
            action={
              <Button variant="secondary" to={`/student/documents/${doc.id}`}>
                Quay lại tài liệu
              </Button>
            }
          />
        </Card>
      )}
      {!locked && approved && (
        <Card>
          <EmptyState
            icon={<ShieldCheck size={24} className="text-brand" />}
            title="Tài liệu đã được phê duyệt"
            description="Không thể nộp lại lên một version đã đạt. Liên hệ giảng viên nếu cần thay đổi."
            action={
              <Button variant="secondary" to={`/student/documents/${doc.id}`}>
                Quay lại tài liệu
              </Button>
            }
          />
        </Card>
      )}
      {!locked && rejected && (
        <Card>
          <EmptyState
            icon={<ShieldCheck size={24} className="text-brand" />}
            title="Tài liệu không đạt"
            description="Quy trình này không cho phép nộp lại tự động sau khi bị đánh dấu không đạt. Hãy liên hệ giảng viên."
            action={
              <Button variant="secondary" to={`/student/documents/${doc.id}`}>
                Quay lại tài liệu
              </Button>
            }
          />
        </Card>
      )}
      {!locked && !approved && !rejected && !awaiting && (
        <Card>
          <MetaGrid
            items={[
              { label: "Lab", value: doc.labTitle ?? "—" },

              {
                label: "Mục Lab",
                value: `${doc.itemCode ?? ""} · ${doc.title}`,
              },

              { label: "Version kế tiếp", value: nextVersion },

              { label: "Deadline", value: dl.ts ? fmtDate(dl.ts) : "—" },

              {
                label: "Giới hạn file",
                value: `${maxSizeMB} MB · ${allowed.join("/").toUpperCase()}`,
              },
            ]}
          />
        </Card>
      )}

      {!locked && !approved && !rejected && !awaiting && (
        <Card className="gap-4">
          <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-line bg-subtle/50 p-4 text-center">
            <Upload size={22} strokeWidth={1.75} className="text-brand" />
            <span className="break-all text-[14px] font-semibold text-ink">
              {file
                ? file.name
                : `Chọn file ${allowed.join("/").toUpperCase()} để nộp`}
            </span>
            {file && (
              <span className="text-[14px] text-muted">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              className="w-auto px-4"
              onClick={() => {
                const input = document.getElementById(
                  "student-file",
                ) as HTMLInputElement | null

                input?.click()
              }}
            >
              Chọn file
            </Button>
            <input
              id="student-file"
              aria-label="File tài liệu"
              type="file"
              accept={allowed.map((ext) => `.${ext}`).join(",")}
              disabled={submitting}
              className="sr-only"
              onChange={onFile}
            />
          </div>
          {error && (
            <p role="alert" className="text-[14px] text-danger">
              {error}
            </p>
          )}

          <Field label="Ghi chú (tùy chọn)">
            <TextArea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                request
                  ? `Đã sửa theo feedback của giảng viên cho ${request.version}...`
                  : "Mô tả ngắn về tài liệu nộp..."
              }
            />
          </Field>

          <Button
            onClick={() => setPending(true)}
            disabled={!file || submitting}
            className="disabled:opacity-50"
            loading={submitting}
          >
            {submitting ? "Đang nộp..." : "Tiếp tục nộp"}
          </Button>
          <Notice>
            File chỉ được lưu dưới dạng metadata trong prototype (demo PRM323
            Lab 2), không tải lên máy chủ thực.
          </Notice>
        </Card>
      )}

      <ConfirmModal
        open={pending}
        title="Xác nhận nộp tài liệu"
        description={
          <>
            <div className="flex flex-col gap-1.5">
              <p>
                Tài liệu: <strong>{doc.title}</strong> · {nextVersion}
              </p>
              {file && (
                <p>
                  File: <strong>{file.name}</strong> (
                  {(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
              <p>
                Sau khi nộp, một version bất biến mới sẽ được tạo và gửi yêu cầu
                review. Bạn không thể sửa hoặc xóa version này. AI và nội dung
                xem trước là dữ liệu mô phỏng.
              </p>
            </div>
          </>
        }
        confirmLabel="Nộp và yêu cầu review"
        onClose={() => setPending(false)}
        onConfirm={submit}
      />
    </>
  )
}
