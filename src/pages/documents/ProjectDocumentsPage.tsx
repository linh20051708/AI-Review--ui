import { useState } from "react"
import { useParams } from "react-router-dom"
import DocumentCard from "@/components/document/DocumentCard"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import SegmentedTabs from "@/components/ui/SegmentedTabs"
import { resolveProjectAcademicContext } from "@/lib/config"
import { useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { documentsFor } from "@/data/selectors"
import type { ProjectDocument } from "@/types"

const filters: { label: string; match: (d: ProjectDocument) => boolean }[] = [
  { label: "Tất cả", match: () => true },
  { label: "Chờ review", match: (d) => d.supervisorStatus === "waiting" || d.supervisorStatus === "inReview" },
  { label: "Cần chỉnh sửa", match: (d) => d.supervisorStatus === "needsRevision" },
  { label: "Khóa gửi review", match: (d) => Boolean(d.submissionLocked) },
]

export default function ProjectDocumentsPage() {
  const { projectId } = useParams()
  const mgmt = useManagement()
  const { projects, classes, offerings, groups } = mgmt
  const { requests } = useReviewStore()
  const [active, setActive] = useState(0)
  const project = projects.find((p) => p.id === projectId)
  if (!project) return <EmptyState title="Không tìm thấy project" />

  // Merge live supervisor decisions before filtering.
  const docs = documentsFor(project, requests, { classes, offerings, groups }).map((d) => ({ ...d, supervisorStatus: requests.find((r) => r.id === d.reviewId)?.supervisorStatus ?? d.supervisorStatus }))
  const tabs = filters.map((f) => `${f.label} (${docs.filter(f.match).length})`)
  const visible = docs.filter(filters[active].match)
  const ctx = resolveProjectAcademicContext(project, mgmt)

  return (
    <>
      <BackLink label={project.name} fallback={`/projects/${project.id}`} />
      <PageHeading title="Tài liệu project" description="Mỗi tài liệu gồm nhiều version bất biến. Giảng viên chỉ xem và review, không chỉnh sửa file." />
      <Card>
        <p className="text-[12px] text-muted">{ctx.cls?.code ?? "—"} · {ctx.group?.name ?? "—"} · Supervisor {project.lecturer}</p>
        <div className="flex items-center justify-between gap-2">
          <Badge tone="brand">Đang thực hiện</Badge>
          <span className="text-[12px] text-muted">{docs.length} tài liệu</span>
        </div>
        <ProgressBar value={project.progress} />
      </Card>
      <SegmentedTabs id="project-docs" tabs={tabs} active={tabs[active]} onChange={(t) => setActive(tabs.indexOf(t))} />
      <div id="project-docs-tabpanel" role="tabpanel" aria-labelledby={`project-docs-tab-${tabs[active]}`}>
        <Notice>Tài liệu (ví dụ Use Case Diagram) chứa các version v1, v2, v3… do sinh viên nộp. Yêu cầu chỉnh sửa sẽ khiến sinh viên tạo version mới; version cũ luôn được giữ lại.</Notice>
        <section className="flex flex-col gap-3">{visible.length ? visible.map((d) => <DocumentCard key={d.id} doc={d} />) : <EmptyState title="Không có tài liệu" />}</section>
      </div>
    </>
  )
}
