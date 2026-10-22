import { useState } from "react"
import { useParams } from "react-router-dom"
import DocumentCard from "@/components/document/DocumentCard"
import BackLink from "@/components/ui/BackLink"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import ProjectStateBadge from "@/components/project/ProjectStateBadge"
import SegmentedTabs from "@/components/ui/SegmentedTabs"
import { resolveProjectAcademicContext } from "@/lib/config"
import { useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { documentsFor } from "@/data/selectors"
import type { ProjectDocument } from "@/types"

const filters: { label: string; match: (d: ProjectDocument) => boolean }[] = [
  { label: "Tất cả", match: () => true },
  { label: "Chờ đánh giá", match: (d) => d.supervisorStatus === "waiting" || d.supervisorStatus === "inReview" },
  { label: "Cần chỉnh sửa", match: (d) => d.supervisorStatus === "needsRevision" },
  { label: "Khóa gửi đánh giá", match: (d) => Boolean(d.submissionLocked) },
]

export default function ProjectDocumentsPage() {
  const { projectId } = useParams()
  const mgmt = useManagement()
  const { projects, classes, offerings, groups } = mgmt
  const { requests } = useReviewStore()
  const [active, setActive] = useState(0)
  const project = projects.find((p) => p.id === projectId)
  if (!project) return <EmptyState title="Không tìm thấy dự án" />

  // Merge live supervisor decisions before filtering.
  const docs = documentsFor(project, requests, { classes, offerings, groups }).map((d) => ({ ...d, supervisorStatus: requests.find((r) => r.id === d.reviewId)?.supervisorStatus ?? d.supervisorStatus }))
  const tabs = filters.map((f) => `${f.label} (${docs.filter(f.match).length})`)
  const priority = (d: ProjectDocument) => d.supervisorStatus === "inReview" ? 0 : d.supervisorStatus === "waiting" ? 1 : d.supervisorStatus === "needsRevision" ? 2 : 3
  const visible = docs.filter(filters[active].match).sort((a, b) => priority(a) - priority(b) || a.order - b.order)
  const ctx = resolveProjectAcademicContext(project, mgmt)

  return (
    <>
      <BackLink label={project.name} fallback={`/projects/${project.id}`} />
      <PageHeading title="Tài liệu dự án"  />
      <div className="flex flex-wrap items-center justify-between gap-2 text-[14px] text-muted">
        <span>{ctx.cls?.code ?? "—"} · {ctx.group?.name ?? "—"}</span><ProjectStateBadge state={project.state} />
      </div>
      <SegmentedTabs id="project-docs" tabs={tabs} active={tabs[active]} onChange={(t) => setActive(tabs.indexOf(t))} />
      <div id="project-docs-tabpanel" role="tabpanel" aria-labelledby={`project-docs-tab-${tabs[active]}`}>
      {visible.length ? <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">{visible.map((d) => <DocumentCard key={d.id} doc={d} compact />)}</ul>  : <EmptyState title="Không có tài liệu" />}
      </div>
    </>
  )
}
