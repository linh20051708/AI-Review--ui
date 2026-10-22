import "@/styles/student-refinement.css"
import { contentText } from "@/components/ui/contentText"
import { ArrowRight, BookOpen, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import ProgressBar from "@/components/ui/ProgressBar"
import { documentsFor } from "@/data/selectors"
import SectionHeader from "@/components/ui/SectionHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { useReviewStore } from "@/data/reviewStore"
import { fmtDate, parseISO } from "@/lib/time"
import type { Project, ProjectDocument, Status } from "@/types"
import { useStudentContext } from "./useStudentContext"

import { selectStudentClass } from "@/app/auth"
import { useManagement } from "@/data/managementStore"
import StudentClassPicker from "./StudentClassPicker"
import { studentClasses } from "./studentClasses"

const DAY = 86_400_000

function DocRow({ doc, hint }: { doc: ProjectDocument; hint?: string }) {
  return (
    <Link to={`/student/documents/${doc.id}`} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
      <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
      <div className="min-w-0 flex-1 leading-[1.45]">
        <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink">
          {doc.title} {doc.latestVersion && <Badge>{doc.latestVersion}</Badge>}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
          <span>{doc.labCode}</span>
          <StatusBadge status={(doc.supervisorStatus ?? doc.documentStatus) as Status} />
          {hint && <span className="text-rust">{hint}</span>}
        </div>
      </div>
      <ArrowRight size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
    </Link>
  )
}

export default function StudentDashboardPage() {
  const ctx = useStudentContext()
  const state = useManagement()
  const classes = studentClasses(state, ctx.student)
  const { audit, requests } = useReviewStore()
  const progressFor = (p: Project) => { const docs = documentsFor(p, requests, state); return docs.length ? Math.round(docs.filter(d => d.supervisorStatus === "approved").length / docs.length * 100) : 0 }
  const { student, project, docs } = ctx

  if (!student) {
    return (
      <section className="flex min-w-0 flex-col gap-3">
        <SectionHeader title="Dự án của tôi" />
        <EmptyState
          title="Chưa có dự án hoạt động"
          description="Vào Dự án của tôi để tham gia lớp, tạo hoặc tham gia nhóm và theo dõi đăng ký dự án."
          action={<Button to="/student/projects">Mở dự án của tôi</Button>}
        />
      </section>
    )
  }

  const needsRevision = docs.filter((d) => d.supervisorStatus === "needsRevision")
  const waiting = docs.filter((d) => d.supervisorStatus === "waiting" || d.supervisorStatus === "inReview")
  const approved = docs.filter((d) => d.supervisorStatus === "approved")
  const notSubmitted = docs.filter((d) => !d.latestVersion && !d.submissionLocked)
  const dueSoon = docs.filter((d) => {
    const dl = ctx.deadlineFor(d.id)
    return !!dl.ts && dl.ts < Date.now() + 7 * DAY && dl.ts >= Date.now() - DAY && d.supervisorStatus !== "approved"
  })

  const registration = state.registrations?.filter(r => r.groupId === ctx.group?.id).at(-1)
  const setupLabel = ctx.group ? registration ? "Xem đăng ký dự án" : "Đăng ký dự án" : classes.length ? "Tạo / tham gia nhóm" : "Tham gia lớp"

  const reviewIds = new Set(docs.map((d) => d.reviewId).filter(Boolean) as string[])
  const activity = audit.filter((e) => reviewIds.has(e.reviewId)).slice(-6).reverse()

  return (
    <div className="student-refine phase-two flex min-w-0 flex-col gap-4">
      <h1 className="text-[26px] font-semibold">Việc cần làm</h1>
      {/* MY TASKS */}
      <section className="flex flex-col gap-3">
        
        <StudentClassPicker />

        {!project && <EmptyState title={registration?.status === "pending" ? "Dự án đang chờ duyệt" : "Chưa có dự án hoạt động"} action={<Button to="/student/groups">{setupLabel}</Button>} />}
        {project && <Button to={!project ? "/student/groups" : needsRevision[0] ? `/student/documents/${needsRevision[0].id}` : notSubmitted[0] ? `/student/documents/${notSubmitted[0].id}/upload` : "/student/documents"}>{!project ? "Thiết lập lớp & nhóm" : needsRevision.length ? "Xem yêu cầu chỉnh sửa" : notSubmitted.length ? "Nộp tài liệu" : "Xem tài liệu"}</Button>}
        <div className="flex flex-col gap-3">
          {[
            { title: "Cần chỉnh sửa", items: needsRevision, accent: "bg-rust" },
            { title: "Tài liệu cần nộp", items: notSubmitted, accent: "bg-brand" },
            { title: "Đang chờ đánh giá", items: waiting, accent: "bg-amber" },

          ].filter(({ items }) => items.length > 0).map(({ title, items, accent }) => (
            <section key={title} className="flex flex-col gap-2 border-b border-line pb-3">
              <div className="flex items-center gap-2 px-3 pt-3 pb-1">
                <span className={`size-2 rounded-full ${accent}`} />
                <p className="text-[14px] font-bold uppercase tracking-wider text-muted">{title}</p>
                <span className="ml-auto text-[14px] font-semibold text-muted">{items.length}</span>
              </div>
              {items.length ? (
                <ul>{items.map((d) => <li key={d.id}><DocRow doc={d} /></li>)}</ul>
              ) : (
                <p className="px-3 pb-3 text-[14px] text-muted">Không có tài liệu.</p>
              )}
            </section>
          ))}
        </div>
      </section>

      {approved.length > 0 && <details><summary>Đã phê duyệt ({approved.length})</summary><ul>{approved.map(d=><li key={d.id}><DocRow doc={d}/></li>)}</ul></details>}
      {/* DEADLINES */}
      {dueSoon.length > 0 && (
        <details><summary>Hạn nộp sắp tới ({dueSoon.length})</summary><section className="flex flex-col gap-3">
          <SectionHeader title="Hạn nộp sắp tới" meta={`${dueSoon.length} tài liệu`} />
          <Card className="gap-0 py-1">
            <ul>
              {dueSoon.map((d) => {
                const dl = ctx.deadlineFor(d.id)
                return <li key={d.id}><DocRow doc={d} hint={dl.ts ? `Đến hạn ${fmtDate(dl.ts)}` : undefined} /></li>
              })}
            </ul>
          </Card>
        </section></details>
      )}

<details><summary>Lớp của tôi ({classes.length})</summary>      <section className="flex min-w-0 flex-col gap-3">
        <SectionHeader title="Các lớp của tôi" meta={`${classes.length} lớp`} linkTo="/student/projects" linkLabel="Dự án của tôi" />
        {classes.map(({cls,course,semester,group,project,registration}) => (
          <Link key={cls.id} to="/student/projects" onClick={() => selectStudentClass(cls.id)} className="min-w-0 rounded-[12px] text-left focus-visible:outline-2 focus-visible:outline-brand">
            <Card className="hover:border-brand/40">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand"><BookOpen size={20}/></span>
                <div className="min-w-0 flex-1"><p className="text-[14px] font-semibold text-ink break-words">{course?.code} · {course?.name}</p><p className="text-[13px] text-muted">{cls.code} · {semester?.name}</p></div>
                <ArrowRight size={18} className="shrink-0 text-muted" />
              </div>
              <div className="flex flex-wrap items-center gap-2"><Badge>{group?.name ?? "Chưa có nhóm"}</Badge><Badge tone={project ? "brand" : "amber"}>{project ? "Đang thực hiện" : registration?.status === "pending" ? "Chờ duyệt dự án" : registration?.status === "changesRequested" ? "Cần sửa đăng ký" : registration?.status === "rejected" ? "Đăng ký bị từ chối" : "Chưa có dự án"}</Badge></div>
              {project && <><p className="text-[15px] font-semibold text-ink break-words">{project.name}</p><ProgressBar value={progressFor(project)} label="Tiến độ tài liệu" /><p className="text-[13px] text-muted">Giảng viên {project.lecturer} · Hạn nộp {fmtDate(parseISO(project.deadline))}</p></>}
            </Card>
          </Link>
        ))}
        {!classes.length && <EmptyState title="Bạn chưa tham gia lớp nào" description="Mỗi môn học có mã lớp riêng. Vào Dự án của tôi để tham gia lớp và đăng ký nhóm." action={<Button to="/student/projects">Mở dự án của tôi</Button>} />}
      </section>

</details>      {/* RECENT ACTIVITY */}
      <details><summary>Hoạt động gần đây ({activity.length})</summary><section className="flex flex-col gap-3">
        <SectionHeader title="Hoạt động gần đây" meta={`${activity.length} sự kiện`} />
        {activity.length ? (
          <Card className="gap-0 py-1">
            <ul>
              {activity.map((e) => {
                const doc = docs.find((d) => d.reviewId === e.reviewId)
                return (
                  <li key={e.id} className="border-b border-line last:border-b-0">
                    <Link
                      to={doc ? `/student/documents/${doc.id}` : "/student/projects"}
                      className="flex items-start gap-2.5 py-3"
                    >
                      <span
                        className={`mt-1 size-2 shrink-0 rounded-full ${
                          e.tone === "rust" ? "bg-rust" : e.tone === "brand" ? "bg-brand" : e.tone === "danger" ? "bg-danger" : "bg-line"
                        }`}
                      />
                      <div className="min-w-0 flex-1 leading-[1.45]">
                        <p className="text-[14px] text-ink">{contentText(e.title)}</p>
                        <p className="text-[14px] text-muted">
                          {e.time} · {contentText(e.actor)}
                        </p>
                      </div>
                      <ArrowRight size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </Card>
        ) : (
          <EmptyState title="Chưa có hoạt động gần đây" />
        )}
      </section></details>
    </div>
  )
}
