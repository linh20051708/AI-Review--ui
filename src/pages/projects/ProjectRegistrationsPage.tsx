import { resolveLabStructure, resolveRuleSet } from "@/lib/config"
import { fmtDateTime } from "@/lib/time"
import { useState } from "react"
import BackLink from "@/components/ui/BackLink"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import { Field, TextArea } from "@/components/ui/Form"
import { useManagement } from "@/data/managementStore"
import { decideRegistration } from "@/data/selfService"

export default function ProjectRegistrationsPage() {
  const { registrations = [], groups, classes, offerings, ruleSets } = useManagement()
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")
  const [error, setError] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const decide = (
    id: string,
    status: "approved" | "changesRequested" | "rejected",
  ) => {
    try {
      decideRegistration(id, status, feedback[id] ?? "")
      setError(false)
      setMessage("Đã ghi nhận quyết định.")
    } catch (e) {
      setError(true)
      setMessage((e as Error).message)
    }
  }
  const rows = registrations.filter(
    (r) => showHistory || r.status === "pending",
  )
  return (
    <>
      <BackLink label="Tổng quan" fallback="/dashboard" />
      <PageHeading
        title="Đăng ký dự án"
        description="Duyệt dự án trước khi Sinh viên được nộp tài liệu."
      />
      {message && (
        <div role={error ? "alert" : "status"}>
          {error ? <p className="rounded-lg bg-danger-soft p-3 text-[14px] text-danger">{message}</p> : <Notice>{message}</Notice>}
        </div>
      )}
      <Button variant="secondary" onClick={() => setShowHistory(!showHistory)}>
        {showHistory ? "Chỉ xem chờ duyệt" : "Xem cả lịch sử"}
      </Button>
      {!rows.length && (
        <Notice>Không có yêu cầu đăng ký dự án trong danh sách này.</Notice>
      )}
      {rows.map((r) => {
        const group = groups.find((g) => g.id === r.groupId),
          cls = classes.find((c) => c.id === group?.classId),
          offering = offerings.find((o) => o.id === cls?.offeringId)
        return (
          <Card key={r.id}>
            <p className="text-sm text-muted">
              {cls?.code} · {group?.name} · {{pending:"Chờ duyệt",changesRequested:"Cần chỉnh sửa",rejected:"Đã từ chối",approved:"Đã duyệt"}[r.status]}
            </p>
            <h2 className="font-semibold">{r.name}</h2>
            <details><summary className="flex min-h-12 cursor-pointer items-center text-[14px] font-semibold">Thông tin đăng ký</summary>
              <p className="text-sm">{r.description}</p>
              <p className="text-sm text-muted">{Number.isFinite(Date.parse(r.submittedAt)) ? fmtDateTime(Date.parse(r.submittedAt)) : "Chưa có thời gian đăng ký"} · {resolveLabStructure(cls,offering).length} Lab</p>
              <p className="text-sm text-muted">{resolveRuleSet(cls,offering,ruleSets).value?.name ?? "Chưa gán bộ quy tắc"}</p>
            </details>
            {r.feedback && <Notice>{r.feedback}</Notice>}
            {r.status === "pending" && (
              <>
                <Field
                  label="Nhận xét / lý do"
                  hint="Bắt buộc khi yêu cầu sửa hoặc từ chối."
                >
                  <TextArea
                    value={feedback[r.id] ?? ""}
                    onChange={(e) =>
                      setFeedback({ ...feedback, [r.id]: e.target.value })
                    }
                  />
                </Field>
                <Button onClick={() => decide(r.id, "approved")}>
                  Duyệt dự án
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => decide(r.id, "changesRequested")}
                >
                  Yêu cầu chỉnh sửa
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => decide(r.id, "rejected")}
                >
                  Từ chối
                </Button>
              </>
            )}
            {r.projectId && (
              <Button variant="secondary" to={`/projects/${r.projectId}`}>
                Xem dự án
              </Button>
            )}
          </Card>
        )
      })}
    </>
  )
}
