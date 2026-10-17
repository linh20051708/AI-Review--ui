import { ArrowRight, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import ProgressBar from "@/components/ui/ProgressBar"
import SectionHeader from "@/components/ui/SectionHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { useReviewStore } from "@/data/reviewStore"
import { fmtDate, parseISO } from "@/lib/time"
import type { ProjectDocument, Status } from "@/types"
import { useStudentContext } from "./useStudentContext"

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
  const { audit } = useReviewStore()
  const { student, group, cls, semester, course, project, docs } = ctx

  if (!student || !project) {
    return (
      <EmptyState
        title="Chưa có project"
        description="Bạn chưa được gán vào project nào trong học kỳ này."
      />
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

  const reviewIds = new Set(docs.map((d) => d.reviewId).filter(Boolean) as string[])
  const activity = audit.filter((e) => reviewIds.has(e.reviewId)).slice(-6).reverse()

  return (
    <>
      {/* WELCOME */}
      <section className="rounded-[14px] bg-brand p-5 text-white">
        <div className="flex items-center gap-3">
          <Avatar initials={student.initials} size={48} />
          <div className="min-w-0 flex-1 leading-[1.45]">
            <h1 className="text-[17px] font-semibold">Chào {student.name}</h1>
            <p className="text-[14px] text-white/80">
              {student.studentCode} · {semester?.name ?? "—"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="olive">Lớp {cls?.code}</Badge>
          <Badge tone="olive">{group?.name}</Badge>
          <Badge tone="olive">{course?.code}</Badge>
        </div>
      </section>

      {/* MY PROJECT */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Project của tôi" meta={`${group?.name ?? ""}`} />
        <Link to="/student/projects">
          <Card className="hover:border-brand/40">
            <div className="flex items-center justify-between gap-3 text-[14px] text-muted">
              <span>
                {course?.code} · {cls?.code} · {group?.name}
              </span>
              <Badge tone="brand">Đang thực hiện</Badge>
            </div>
            <p className="text-[17px] leading-[1.45] font-semibold text-ink">{project.name}</p>
            <ProgressBar value={docs.length ? Math.round(docs.filter((d) => d.supervisorStatus === "approved").length / docs.length * 100) : 0} label="Tiến độ tài liệu" />
            <p className="text-[14px] text-muted">
              Supervisor {project.lecturer} · Deadline {fmtDate(parseISO(project.deadline))}
            </p>
          </Card>
        </Link>
      </section>

      {/* MY TASKS */}
      <section className="flex flex-col gap-3">
        <SectionHeader title="Việc của tôi" meta={`${docs.length} tài liệu`} />
        <div className="flex flex-col gap-3">
          {[
            { title: "Tài liệu cần nộp", items: notSubmitted, accent: "bg-brand" },
            { title: "Cần chỉnh sửa", items: needsRevision, accent: "bg-rust" },
            { title: "Đang chờ review", items: waiting, accent: "bg-amber" },
            { title: "Đã phê duyệt", items: approved, accent: "bg-olive" },
          ].map(({ title, items, accent }) => (
            <Card key={title} className="gap-0 py-1">
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
            </Card>
          ))}
        </div>
      </section>

      {/* DEADLINES */}
      {dueSoon.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Deadline sắp tới" meta={`${dueSoon.length} tài liệu`} />
          <Card className="gap-0 py-1">
            <ul>
              {dueSoon.map((d) => {
                const dl = ctx.deadlineFor(d.id)
                return <li key={d.id}><DocRow doc={d} hint={dl.ts ? `Đến hạn ${fmtDate(dl.ts)}` : undefined} /></li>
              })}
            </ul>
          </Card>
        </section>
      )}

      {/* RECENT ACTIVITY */}
      <section className="flex flex-col gap-3">
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
                        <p className="text-[14px] text-ink">{e.title}</p>
                        <p className="text-[14px] text-muted">
                          {e.time} · {e.actor}
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
      </section>
    </>
  )
}
