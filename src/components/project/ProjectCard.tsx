import { activityText } from "@/components/ui/contentText"
import { groupMemberLimit } from "@/data/selfServicePolicy"
import { Link } from "react-router-dom"
import ProjectStateBadge from "./ProjectStateBadge"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import MetaGrid from "@/components/ui/MetaGrid"
import ProgressBar from "@/components/ui/ProgressBar"
import { groupHealthMeta } from "@/data/mockData"
import { useManagement } from "@/data/managementStore"
import type { StudentGroup } from "@/types"

export default function ProjectCard({ group, compact = false }: { group: StudentGroup; compact?: boolean }) {
  const { projects, classes } = useManagement()
  const limit = groupMemberLimit(classes.find(c => c.id === group.classId))
  const health = groupHealthMeta[group.health]
  const project = projects.find((p) => p.id === group.projectId)
  if (compact) return <li className="flex min-w-0 flex-col gap-1 px-4 py-3">
    <div className="flex items-center justify-between gap-2">
      <Link to={`/groups/${group.id}`} className="flex min-h-12 min-w-0 flex-1 items-center text-[16px] font-semibold text-brand">{group.name}</Link>
      {project && <ProjectStateBadge state={project.state} />}
    </div>
    <Link to={project ? `/projects/${project.id}` : `/groups/${group.id}`} className="flex min-h-12 items-center justify-between gap-3 text-[14px] font-medium">
      <span className="min-w-0 break-words">{project?.name ?? "Gán project"}</span><span aria-hidden="true">›</span>
    </Link>
    <p className="text-[14px] text-muted">{group.memberIds.length}/{limit} thành viên · {group.pendingReviews} chờ review</p>
    {group.memberIds.length > limit && <p className="text-[14px] text-amber">Vượt giới hạn · Không thể thêm thành viên</p>}
    <details>
      <summary className="flex min-h-12 cursor-pointer items-center text-[14px] font-medium text-muted">Thông tin nhóm</summary>
      <div className="flex flex-col gap-3 pb-2 text-[14px]">
        <ProgressBar value={group.progress} label="Tiến độ nhóm (ghi nhận)" />
        {project?.state !== "archived" && <p>{health.label}</p>}
        <p className="text-muted">Hoạt động: {activityText(group.lastActivity)}</p>
        <Button variant="secondary" to={`/groups/${group.id}`}>Quản lý nhóm</Button>
      </div>
    </details>
  </li>
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[12px] text-muted">{group.name}</span>
        <span className="flex max-w-full flex-wrap gap-1">{project && <ProjectStateBadge state={project.state} />}{project?.state !== "archived" && <Badge tone={health.tone}>{health.label}</Badge>}</span>
      </div>
      <p className="text-[17px] leading-[1.45] font-semibold text-ink">{project?.name ?? "Chưa gán project"}</p>
      <ProgressBar value={group.progress} label="Tiến độ nhóm (ghi nhận)" />
      {group.memberIds.length > limit && <p className="text-[14px] text-amber">Vượt giới hạn · Không thể thêm thành viên</p>}
      <MetaGrid
        items={[
          { label: "Thành viên", value: `${group.memberIds.length}/${limit}` },
          { label: "Chờ review", value: `${group.pendingReviews} tài liệu` },
          { label: "Hoạt động mới", value: activityText(group.lastActivity) },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" to={`/groups/${group.id}`}>Quản lý nhóm</Button>
        {project ? <Button variant="secondary" to={`/projects/${project.id}`}>Xem project</Button> : <Button variant="secondary" to={`/groups/${group.id}`}>Gán project</Button>}
      </div>
    </Card>
  )
}
