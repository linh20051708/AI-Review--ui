import Button from "@/components/ui/Button"
import "@/styles/student-refinement.css"
import { FileText } from "lucide-react"
import { Fragment, useState } from "react"
import { Link } from "react-router-dom"
import Badge from "@/components/ui/Badge"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import StatusBadge from "@/components/ui/StatusBadge"
import { fmtDate } from "@/lib/time"
import type { ProjectDocument } from "@/types"
import StudentClassPicker from "./StudentClassPicker"
import { useStudentContext } from "./useStudentContext"

const filters: { label: string; match: (d: ProjectDocument) => boolean }[] = [
  { label: "Tất cả", match: () => true },
  { label: "Chưa nộp", match: (d) => !d.latestVersion && !d.submissionLocked },
  { label: "Chờ đánh giá", match: (d) => d.supervisorStatus === "waiting" || d.supervisorStatus === "inReview" },
  { label: "Cần chỉnh sửa", match: (d) => d.supervisorStatus === "needsRevision" },
  { label: "Đã phê duyệt", match: (d) => d.supervisorStatus === "approved" },
  { label: "Không đạt", match: (d) => d.supervisorStatus === "notAccepted" },
]

export default function StudentDocumentsPage() {
  const ctx = useStudentContext()
  const [active, setActive] = useState(0)
  const { docs } = ctx
  const tabs = filters.map((f) => `${f.label} (${docs.filter(f.match).length})`)
  const visible = docs.filter(filters[active].match)

  return (
    <div className="student-refine phase-two flex min-w-0 flex-col gap-4">
      <PageHeading
        eyebrow="TÀI LIỆU"
        title="Tài liệu của tôi"

      />
      <StudentClassPicker destination="/student/documents" />
      {ctx.project && <label className="flex flex-col gap-2 text-[14px] font-semibold">Trạng thái<select className="min-h-12 w-full rounded-lg border bg-white p-3" value={active} onChange={e=>setActive(Number(e.target.value))}>{tabs.map((t,i)=><option key={i} value={i}>{t}</option>)}</select></label>}
      <section className="flex flex-col gap-3">
        {visible.length ? (
          ctx.labs.map((lab) => <Fragment key={lab.id}>
            {visible.some((d) => d.lab.id === lab.id) && <h2 className="text-[16px] font-semibold">{lab.code} · {lab.title}</h2>}
            <div className="rounded-xl border border-line bg-white px-4">{visible.filter((d) => d.lab.id === lab.id).map((d) => {
            const dl = ctx.deadlineFor(d.id)
            return (
              <Link className="student-row" key={d.id} to={!d.latestVersion && !d.submissionLocked ? `/student/documents/${d.id}/upload` : `/student/documents/${d.id}`}><div>
                  <div className="flex items-center justify-between gap-3 text-[14px] text-muted">
                    {dl.ts && <span className="shrink-0">Đến hạn {fmtDate(dl.ts)}</span>}
                  </div>
                  <p className="flex flex-wrap items-center gap-2 text-[16px] leading-[1.45] font-semibold text-ink">
                    <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
                    {d.title}
                    {d.latestVersion && <Badge>{d.latestVersion}</Badge>}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <StatusBadge status={d.supervisorStatus ?? d.documentStatus} />

                    {d.submissionLocked && <Badge tone="neutral">Khóa gửi đánh giá</Badge>}
                  </div>
                </div><span className="text-[14px] font-semibold text-brand">{d.supervisorStatus==="needsRevision" ? "Xem feedback" : !d.latestVersion && !d.submissionLocked ? "Nộp bài" : "Xem"}</span>
              </Link>
            )
          })}</div></Fragment>)
        ) : (
          <EmptyState title={ctx.project ? "Không có tài liệu phù hợp" : "Chưa có dự án hoạt động"} description={ctx.project ? "Thử chọn bộ lọc khác." : "Kiểm tra đăng ký dự án của lớp đang xem."} action={!ctx.project ? <Button to="/student/groups">Xem đăng ký dự án</Button> : undefined} />
        )}
      </section>
    </div>
  )
}
