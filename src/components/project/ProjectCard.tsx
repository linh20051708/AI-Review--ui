import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import MetaGrid from "@/components/ui/MetaGrid"
import ProgressBar from "@/components/ui/ProgressBar"
import { groupHealthMeta } from "@/data/mockData"
import { useManagement } from "@/data/managementStore"
import type { StudentGroup } from "@/types"

export default function ProjectCard({ group }: { group: StudentGroup }) {
  const { projects } = useManagement()
  const health = groupHealthMeta[group.health]
  const project = projects.find((p) => p.id === group.projectId)
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-muted">{group.name}</span>
        {project?.state === "archived" ? <Badge>Đã lưu trữ</Badge> : <Badge tone={health.tone}>{health.label}</Badge>}
      </div>
      <p className="text-[17px] leading-[1.45] font-semibold text-ink">{project?.name ?? "Chưa gán project"}</p>
      <ProgressBar value={group.progress} label="Tiến độ" />
      <MetaGrid
        items={[
          { label: "Thành viên", value: `${group.memberIds.length} sinh viên` },
          { label: "Chờ review", value: `${group.pendingReviews} tài liệu` },
          { label: "Hoạt động mới", value: group.lastActivity },
        ]}
      />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" to={`/groups/${group.id}`}>Quản lý nhóm</Button>
        {project ? <Button variant="secondary" to={`/projects/${project.id}`}>Xem project</Button> : <Button variant="secondary" to={`/groups/${group.id}`}>Gán project</Button>}
      </div>
    </Card>
  )
}
