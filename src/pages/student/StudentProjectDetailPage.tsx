import { CalendarClock, Lock } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import MetaGrid from "@/components/ui/MetaGrid"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import SectionHeader from "@/components/ui/SectionHeader"
import StatusBadge from "@/components/ui/StatusBadge"
import { useManagement } from "@/data/managementStore"
import { fmtDate, parseISO } from "@/lib/time"
import type { Lab, ProjectDocument } from "@/types"
import { useStudentContext } from "./useStudentContext"

function ItemRow({ doc, deadline }: { doc: ProjectDocument; deadline?: string }) {
  const status = doc.supervisorStatus ?? doc.documentStatus
  const locked = Boolean(doc.submissionLocked)
  const needs = doc.supervisorStatus === "needsRevision"
  const awaiting = doc.supervisorStatus === "waiting" || doc.supervisorStatus === "inReview"
  const approved = doc.supervisorStatus === "approved"
  const neverSubmitted = !doc.latestVersion && !locked
  const cta = approved || awaiting || needs ? "Xem chi tiết" : neverSubmitted ? "Nộp tài liệu" : "Xem"
  const to = locked || neverSubmitted ? `/student/documents/${doc.id}/upload` : `/student/documents/${doc.id}`

  return (
    <li className="border-b border-line last:border-b-0">
      <Link to={to} className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1 leading-[1.45]">
          <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-ink">
            {doc.title}
            {doc.latestVersion && <Badge>{doc.latestVersion}</Badge>}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-muted">
            <StatusBadge status={status} />
            {deadline && <span className="inline-flex items-center gap-1"><CalendarClock size={12} />{deadline}</span>}
          </div>
          {locked && (
            <p className="mt-1 flex items-center gap-1 text-[14px] text-rust">
              <Lock size={12} /> Bạn cần hoàn thành tài liệu trước đó để tiếp tục.
            </p>
          )}
        </div>
        <span className="flex min-h-12 shrink-0 items-center rounded-lg border border-line px-3 text-[14px] font-semibold text-brand">{cta}</span>
      </Link>
    </li>
  )
}

export default function StudentProjectDetailPage() {
  const { projectId } = useParams()
  const ctx = useStudentContext()
  const { students } = useManagement()
  const { project, group, cls, semester, course, docs } = ctx

  if (!project || !group || (projectId && projectId !== project.id)) return <EmptyState title="Không tìm thấy project của bạn" />

  const members = group.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean)

  return (
    <>
      <BackLink label="Tổng quan" fallback="/student/dashboard" />
      <PageHeading
        eyebrow={[semester?.name, course?.code, cls?.code].filter(Boolean).join(" → ").toUpperCase()}
        title={project.name}
        description={project.description}
      />
      <Card>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[14px] text-muted">{group.name}</span>
          <Badge tone="brand">Đang thực hiện</Badge>
        </div>
        <p className="text-[17px] leading-[1.45] font-semibold text-ink">{project.name}</p>
        <ProgressBar value={docs.length ? Math.round(docs.filter((d) => d.supervisorStatus === "approved").length / docs.length * 100) : 0} label="Tiến độ tài liệu" />
        <MetaGrid
          items={[
            { label: "Học kỳ", value: semester?.name ?? "—" },
            { label: "Môn học", value: `${course?.code ?? "—"} · ${course?.name ?? ""}` },
            { label: "Lớp", value: cls?.code ?? "—" },
            { label: "Supervisor", value: project.lecturer },
            { label: "Deadline", value: fmtDate(parseISO(project.deadline)) },
            { label: "Thành viên", value: `${members.filter(Boolean).length} sinh viên` },
          ]}
        />
      </Card>

      <section className="flex flex-col gap-3">
        <SectionHeader title="Thành viên nhóm" meta={`${members.filter(Boolean).length} sinh viên`} />
        <Card className="gap-0 py-1">
          <ul className="divide-y divide-line">
            {members.map((m) => (
              <li key={m!.id} className="flex items-center gap-3 py-2.5">
                <Avatar initials={m!.initials} size={36} />
                <div className="min-w-0 flex-1 leading-[1.45]">
                  <p className="text-[14px] font-semibold text-ink">{m!.name}</p>
                  <p className="text-[14px] text-muted">{m!.studentCode}</p>
                </div>
                {group.memberIds[0] === m!.id ? <Badge tone="brand">Trưởng nhóm</Badge> : <Badge>Thành viên</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Cấu trúc Lab"
          meta={`${ctx.labs.reduce((n, l) => n + l.items.length, 0)} tài liệu`}
          description="Cấu trúc kế thừa từ lớp/môn học. Sinh viên chỉ nộp tài liệu, không thay đổi cấu hình."
        />
        {ctx.labs.map((lab: Lab) => {
          return (
            <Card key={lab.id} className="gap-0 py-1">
              <div className="flex items-center justify-between gap-2 px-3 pt-3 pb-2">
                <div className="min-w-0 leading-[1.4]">
                  <p className="text-[14px] font-semibold tracking-wide text-brand">{lab.code}</p>
                  <p className="text-[14px] font-semibold text-ink">{lab.title}</p>
                </div>
                {lab.deadline && (
                  <span className="inline-flex shrink-0 items-center gap-1 text-[14px] text-muted">
                    <CalendarClock size={12} /> {fmtDate(parseISO(lab.deadline))}
                  </span>
                )}
              </div>
              <ul>
                {lab.items.map((item) => {
                  const doc = docs.find((d) => d.id === item.id)
                  if (!doc) return null
                  const dl = ctx.deadlineFor(doc.id)
                  return (
                    <ItemRow
                      key={doc.id}
                      doc={doc}
                      deadline={dl.ts ? fmtDate(dl.ts) : undefined}
                    />
                  )
                })}
              </ul>
            </Card>
          )
        })}
        <Notice>
          Tài liệu phụ thuộc cần được phê duyệt trước khi nộp. Mỗi lần nộp tạo một version bất biến mới (v1, v2, v3…).
        </Notice>
      </section>
    </>
  )
}
