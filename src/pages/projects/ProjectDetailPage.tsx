import { Archive, CalendarClock, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import DocumentCard from "@/components/document/DocumentCard"
import DocumentRoadmapItem from "@/components/document/DocumentRoadmapItem"
import MemberRow from "@/components/project/MemberRow"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import TimelineItem from "@/components/review/TimelineItem"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmModal from "@/components/ui/ConfirmModal"
import EmptyState from "@/components/ui/EmptyState"
import MetaGrid from "@/components/ui/MetaGrid"
import MoreMenu from "@/components/ui/MoreMenu"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import SectionHeader from "@/components/ui/SectionHeader"
import SegmentedTabs from "@/components/ui/SegmentedTabs"
import { toast } from "@/components/ui/Toast"
import { lockReason } from "@/data/mockData"
import { updateManagement, useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { documentsFor } from "@/data/selectors"
import { resolveProjectAcademicContext } from "@/lib/config"
import { courseLabel } from "@/lib/academic"
import { fmtDate, fmtDateTime, parseISO } from "@/lib/time"

const TABS = ["Tổng quan", "Tài liệu", "Thành viên", "Lịch sử review"]

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState(TABS[0])
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState<"archive" | "delete" | null>(null)
  const mgmt = useManagement()
  const { projects, classes, offerings } = mgmt
  const { requests, audit } = useReviewStore()
  const project = projects.find((p) => p.id === projectId)

  if (!project) return <EmptyState title="Không tìm thấy project" description={`“${projectId}” không tồn tại.`} />

  const ctx = resolveProjectAcademicContext(project, mgmt)
  const { semester, course, teachingMethod: method, ruleSet: rule } = ctx
  const classCode = ctx.cls?.code ?? "—"
  const groupName = ctx.group?.name ?? "—"
  const docs = documentsFor(project, requests, { classes, offerings, groups: mgmt.groups })
  const blocked = docs.find((d) => d.submissionLocked && d.documentStatus === "draft")
  const projectReviews = requests.filter((r) => r.projectId === project.id)
  const events = audit.filter((e) => projectReviews.some((r) => r.id === e.reviewId))
  const archived = project.state === "archived"

  const setState = (state: "active" | "archived") => updateManagement((s) => ({ projects: s.projects.map((p) => (p.id === project.id ? { ...p, state } : p)) }))

  return (
    <>
      <BackLink label={`${classCode} / ${groupName}`} fallback={ctx.cls ? `/classes/${ctx.cls.id}` : "/projects"} />
      <PageHeading
        eyebrow={[semester?.name, course?.code, classCode, groupName].join(" → ").toUpperCase()}
        title={project.name}
        description={project.description}
        aside={
          <MoreMenu
            items={[
              { label: "Chỉnh sửa thông tin", icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => setEditing(true) },
              archived
                ? { label: "Khôi phục project", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: () => { setState("active"); toast("Đã khôi phục project") } }
                : { label: "Lưu trữ project", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: () => setConfirm("archive") },
              // Hard delete only exists when nothing was ever submitted or reviewed.
              ...(!project.hasHistory ? [{ label: "Xóa project", danger: true, icon: <Trash2 size={16} strokeWidth={1.75} />, onSelect: () => setConfirm("delete") }] : []),
            ]}
          />
        }
      />
      <Card>
        <div className="flex items-center justify-between">
          <Badge tone={archived ? "neutral" : "brand"}>{archived ? "Đã lưu trữ" : "Đang thực hiện"}</Badge>
          <CalendarClock size={18} strokeWidth={1.75} className="text-muted" />
        </div>
        <MetaGrid
          items={[
            { label: "Học kỳ", value: semester?.name ?? "—" },
            { label: "Môn học", value: courseLabel(course) },
            { label: "Lớp", value: classCode },
            { label: "Nhóm", value: groupName },
            { label: "Supervisor", value: project.lecturer },
            { label: "Phương pháp dạy", value: method.value ?? "—" },
            { label: "Ngày bắt đầu", value: fmtDate(parseISO(project.startDate)) },
            { label: "Deadline", value: fmtDateTime(parseISO(project.deadline)) },
            ...(project.reviewCutoff ? [{ label: "Hạn cuối gửi review", value: fmtDateTime(parseISO(project.reviewCutoff)) }] : []),
          ]}
        />
        <Link to={`/rule-sets#${rule.value?.id ?? ""}`} className="flex items-center justify-between gap-2 rounded-[8px] border border-line px-3 py-2.5">
          <span className="leading-[1.4]">
            <span className="block text-[11px] text-muted">Bộ quy tắc</span>
            <span className="block text-[13px] font-semibold text-ink">{rule.value?.name ?? "—"}</span>
            <span className="block text-[11px] text-muted">{rule.source}</span>
          </span>
          <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
        </Link>
        <ProgressBar value={project.progress} label="Tiến độ tài liệu" />
      </Card>
      {archived && <Notice>Project đã được lưu trữ. Toàn bộ tài liệu, version và lịch sử review vẫn được giữ nguyên ở chế độ chỉ đọc.</Notice>}

      <SegmentedTabs id="project-detail" tabs={TABS} active={tab} onChange={setTab} />

      <div id="project-detail-tabpanel" role="tabpanel" aria-labelledby={`project-detail-tab-${tab}`}>
      {tab === "Tổng quan" && (
        <>
          {project.nextStep && (
            <Card tinted>
              <p className="text-[14px] font-semibold text-ink">Việc tiếp theo của bạn</p>
              <p className="text-[13px] leading-[1.45] text-ink">{project.nextStep}</p>
            </Card>
          )}
          <section className="flex flex-col gap-3">
            <SectionHeader title="Tiến độ tài liệu" description="Dependency chỉ khóa việc gửi yêu cầu review. Tài liệu sau vẫn có thể tồn tại ở dạng bản nháp." />
            <Card className="gap-0 py-1">
              <ul>{docs.map((d) => <DocumentRoadmapItem key={d.id} doc={d} />)}</ul>
            </Card>
            {blocked?.dependsOn && <Notice>{blocked.title}: {lockReason(blocked.dependsOn)}</Notice>}
          </section>
        </>
      )}

      {tab === "Tài liệu" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Tài liệu" meta={`${docs.length} tài liệu`} linkTo={`/projects/${project.id}/documents`} linkLabel="Mở trang tài liệu" />
          {docs.map((d) => <DocumentCard key={d.id} doc={d} />)}
        </section>
      )}

      {tab === "Thành viên" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Thành viên" meta={`${project.members.length} sinh viên`} linkTo={`/groups/${project.groupId}`} linkLabel="Quản lý nhóm" />
          {project.members.length ? (
            <Card className="gap-0 py-1">
              <ul className="divide-y divide-line">{project.members.map((m) => <MemberRow key={m.name} member={m} />)}</ul>
            </Card>
          ) : (
            <EmptyState title="Chưa có thành viên" />
          )}
        </section>
      )}

      {tab === "Lịch sử review" && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Lịch sử review" meta={`${events.length} sự kiện`} />
          {projectReviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {projectReviews.map((r) => (
                <Link key={r.id} to={`/reviews/${r.id}/history`} className="rounded-[8px] border border-line bg-white px-3 py-2 text-[12px] font-semibold text-brand">
                  {r.documentTitle} {r.version}
                </Link>
              ))}
            </div>
          )}
          {events.length ? (
            <Card>
              <ol>{events.map((e, i) => <TimelineItem key={e.id} event={e} last={i === events.length - 1} />)}</ol>
            </Card>
          ) : (
            <EmptyState title="Chưa có lịch sử review" />
          )}
        </section>
      )}

      {!archived && (
        <Button variant="secondary" icon={<Pencil size={16} strokeWidth={1.75} />} onClick={() => setEditing(true)}>
          Chỉnh sửa thông tin project
        </Button>
      )}
      </div>

      <ProjectFormModal open={editing} project={project} onClose={() => setEditing(false)} />
      <ConfirmModal
        open={confirm === "archive"}
        title="Lưu trữ project"
        description={`${project.name} · ${classCode} · ${groupName}`}
        confirmLabel="Lưu trữ project"
        onConfirm={() => {
          setState("archived")
          toast("Đã lưu trữ project")
        }}
        onClose={() => setConfirm(null)}
      >
        <Notice>Project sẽ ngừng hoạt động. Tài liệu, version, feedback và lịch sử review được giữ nguyên và vẫn có thể xem.</Notice>
      </ConfirmModal>
      <ConfirmModal
        open={confirm === "delete"}
        title="Xóa project"
        description="Project chưa có tài liệu nộp hay lịch sử review nên có thể xóa."
        confirmLabel="Xóa project"
        danger
        onConfirm={() => {
          updateManagement((s) => ({ projects: s.projects.filter((p) => p.id !== project.id), groups: s.groups.map((g) => (g.projectId === project.id ? { ...g, projectId: undefined } : g)) }))
          toast("Đã xóa project")
          navigate("/projects")
        }}
        onClose={() => setConfirm(null)}
      />
    </>
  )
}
