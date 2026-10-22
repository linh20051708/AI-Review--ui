import ProjectStateBadge from "@/components/project/ProjectStateBadge"
import uiLabel from "@/lib/uiLabels"
import PhaseTwoTabs from "@/components/ui/PhaseTwoTabs"
import "@/styles/phase-two.css"
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
import { lockReason, projects as sampleProjects } from "@/data/mockData"
import { updateManagement, useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { documentsFor } from "@/data/selectors"
import { resolveProjectAcademicContext } from "@/lib/config"
import { courseLabel } from "@/lib/academic"
import { fmtDate, fmtDateTime, parseISO } from "@/lib/time"

const TABS = ["Tổng quan", "Tài liệu", "Thành viên", "Lịch sử đánh giá", "Thông tin"]

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

  if (!project) return <EmptyState title="Không tìm thấy dự án" description={`“${projectId}” không tồn tại.`} />

  const ctx = resolveProjectAcademicContext(project, mgmt)
  const { semester, course, teachingMethod: method, ruleSet: rule } = ctx
  const classCode = ctx.cls?.code ?? "—"
  const groupName = ctx.group?.name ?? "—"
  const docs = documentsFor(project, requests, { classes, offerings, groups: mgmt.groups })
  const blocked = docs.find((d) => d.submissionLocked && d.documentStatus === "draft")
  const projectReviews = requests.filter((r) => r.projectId === project.id)
  const events = audit.filter((e) => projectReviews.some((r) => r.id === e.reviewId))
  const nextDocument = docs.find(d => d.supervisorStatus === "needsRevision") ?? docs.find(d => ["waiting", "inReview"].includes(d.supervisorStatus ?? "")) ?? docs.find(d => !d.latestVersion && !d.submissionLocked)
  const suggestedNextStep = nextDocument
    ? nextDocument.supervisorStatus === "needsRevision" ? `${nextDocument.title}: chờ nhóm nộp bản chỉnh sửa.`
      : ["waiting", "inReview"].includes(nextDocument.supervisorStatus ?? "") ? `Đánh giá ${nextDocument.title} ${nextDocument.latestVersion ?? ""}.`
      : `${nextDocument.title}: chờ nhóm nộp tài liệu.`
    : docs.length && docs.every(d => d.supervisorStatus === "approved") ? "Tất cả tài liệu đã được giảng viên phê duyệt." : "Đối chiếu trạng thái tài liệu trước khi tiếp tục."
  const nextStep = project.nextStep === sampleProjects.find(p => p.id === project.id)?.nextStep ? suggestedNextStep : project.nextStep
  const archived = project.state === "archived"

  const setState = (state: "active" | "archived") => updateManagement((s) => ({ projects: s.projects.map((p) => (p.id === project.id ? { ...p, state } : p)) }))

  return (
    <div className="phase-two flex min-w-0 flex-col gap-4">
      <BackLink label={`${classCode} / ${groupName}`} fallback={ctx.cls ? `/classes/${ctx.cls.id}` : "/projects"} />
      <PageHeading
        eyebrow={`${classCode} · ${groupName}`}
        title={project.name}

        aside={
          <MoreMenu
            items={[
              { label: "Chỉnh sửa thông tin", icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => setEditing(true) },
              archived
                ? { label: "Khôi phục dự án", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: () => { setState("active"); toast("Đã khôi phục dự án") } }
                : { label: "Lưu trữ dự án", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: () => setConfirm("archive") },
              // Hard delete only exists when nothing was ever submitted or reviewed.
              ...(!project.hasHistory ? [{ label: "Xóa dự án", danger: true, icon: <Trash2 size={16} strokeWidth={1.75} />, onSelect: () => setConfirm("delete") }] : []),
            ]}
          />
        }
      />
      <Card>
        <div className="flex items-center justify-between">
          <ProjectStateBadge state={project.state} />
          <CalendarClock size={18} strokeWidth={1.75} className="text-muted" />
        </div>
        <ProgressBar value={project.progress} label="Tiến độ dự án (ghi nhận)" />
        <p className="text-[14px] text-muted">Tài liệu được duyệt: {docs.filter(d => d.supervisorStatus === "approved").length}/{docs.length}</p>
      </Card>
      {archived && <Notice>Dự án đã được lưu trữ. Toàn bộ tài liệu, phiên bản và lịch sử đánh giá vẫn được giữ nguyên ở chế độ chỉ đọc.</Notice>}

      <Button to={`/projects/${project.id}/documents`}>Mở tài liệu</Button>
      <PhaseTwoTabs id="project" tabs={TABS} active={tab} onChange={setTab} />
      {tab === "Thông tin" && <section role="tabpanel" id="project-panel-4" aria-labelledby="project-4" className="flex flex-col gap-4"><p className="text-[14px]">{project.description}</p>        <MetaGrid
          items={[
            { label: "Học kỳ", value: semester?.name ?? "—" },
            { label: "Môn học", value: courseLabel(course) },
            { label: "Lớp", value: classCode },
            { label: "Nhóm", value: groupName },
            { label: "Giảng viên", value: project.lecturer },
            { label: "Phương pháp dạy", value: uiLabel(method.value) },
            { label: "Ngày bắt đầu", value: fmtDate(parseISO(project.startDate)) },
            { label: "Hạn nộp", value: fmtDateTime(parseISO(project.deadline)) },
            ...(project.reviewCutoff ? [{ label: "Hạn cuối gửi đánh giá", value: fmtDateTime(parseISO(project.reviewCutoff)) }] : []),
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
</section>}

      {tab === "Tổng quan" && (
        <section role="tabpanel" id="project-panel-0" aria-labelledby="project-0" className="flex flex-col gap-4">
          {project.nextStep && (
            <div className="border-l-2 border-brand pl-3">
              <p className="text-[14px] font-semibold text-ink">Việc tiếp theo của bạn</p>
              <p className="text-[14px] leading-[1.45] text-ink">{nextStep}</p>
            </div>
          )}
          <section className="flex flex-col gap-3">
            <SectionHeader title="Tiến độ tài liệu"  />
            <Card className="gap-0 py-1">
              <ul>{docs.map((d) => <DocumentRoadmapItem key={d.id} doc={d} />)}</ul>
            </Card>
            {blocked?.dependsOn && <Notice>{blocked.title}: {lockReason(blocked.dependsOn)}</Notice>}
          </section>
        </section>
      )}

      {tab === "Tài liệu" && (
        <section role="tabpanel" id="project-panel-1" aria-labelledby="project-1" className="flex flex-col gap-3">
          <SectionHeader title="Tài liệu" meta={`${docs.length} tài liệu`} linkTo={`/projects/${project.id}/documents`} linkLabel="Mở trang tài liệu" />
          {docs.map((d) => <DocumentCard key={d.id} doc={d} />)}
        </section>
      )}

      {tab === "Thành viên" && (
        <section role="tabpanel" id="project-panel-2" aria-labelledby="project-2" className="flex flex-col gap-3">
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

      {tab === "Lịch sử đánh giá" && (
        <section role="tabpanel" id="project-panel-3" aria-labelledby="project-3" className="flex flex-col gap-3">
          <SectionHeader title="Lịch sử đánh giá" meta={`${events.length} sự kiện`} />
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
            <EmptyState title="Chưa có lịch sử đánh giá" />
          )}
        </section>
      )}

      {!archived && tab === "Thông tin" && (
        <Button variant="secondary" icon={<Pencil size={16} strokeWidth={1.75} />} onClick={() => setEditing(true)}>
          Chỉnh sửa thông tin dự án
        </Button>
      )}

      <ProjectFormModal open={editing} project={project} onClose={() => setEditing(false)} />
      <ConfirmModal
        open={confirm === "archive"}
        title="Lưu trữ dự án"
        description={`${project.name} · ${classCode} · ${groupName}`}
        confirmLabel="Lưu trữ dự án"
        onConfirm={() => {
          setState("archived")
          toast("Đã lưu trữ dự án")
        }}
        onClose={() => setConfirm(null)}
      >
        <Notice>Dự án sẽ ngừng hoạt động. Tài liệu, phiên bản, phản hồi và lịch sử đánh giá được giữ nguyên và vẫn có thể xem.</Notice>
      </ConfirmModal>
      <ConfirmModal
        open={confirm === "delete"}
        title="Xóa dự án"
        description="Dự án chưa có tài liệu nộp hay lịch sử đánh giá nên có thể xóa."
        confirmLabel="Xóa dự án"
        danger
        onConfirm={() => {
          updateManagement((s) => ({ projects: s.projects.filter((p) => p.id !== project.id), groups: s.groups.map((g) => (g.projectId === project.id ? { ...g, projectId: undefined } : g)) }))
          toast("Đã xóa dự án")
          navigate("/projects")
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}
