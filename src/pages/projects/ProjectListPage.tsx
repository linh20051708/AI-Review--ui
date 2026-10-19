import { groupHealthMeta } from "@/data/mockData"
import Badge from "@/components/ui/Badge"
import ProjectStateBadge from "@/components/project/ProjectStateBadge"
import "@/styles/phase-two.css"
import { Folder, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SmartFilterBar from "@/components/filters/SmartFilterBar"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import { projectRecords, projectStatusLabels } from "@/data/filterRecords"
import { useManagement } from "@/data/managementStore"
import { currentSemester } from "@/lib/academic"
import { resolveProjectAcademicContext } from "@/lib/config"
import { filterRecords, type FilterState } from "@/lib/smartFilter"
import { fmtDate, parseISO } from "@/lib/time"

export default function ProjectListPage() {
  const mgmt = useManagement()
  const { projects, classes, groups, semesters, courses } = mgmt
  const [creating, setCreating] = useState(false)
  const [filter, setFilter] = useState<FilterState>(() => ({ facets: { semester: [currentSemester(semesters).id], status: ["active"] }, q: "" }))
  const records = useMemo(() => projectRecords(projects, groups, classes), [projects, groups, classes])
  const visible = filterRecords(records, filter).map((r) => r.item)

  return (
    <div className="phase-two flex min-w-0 flex-col gap-4">
      <PageHeading eyebrow="QUẢN LÝ PROJECT" title="Project"  />
      <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setCreating(true)}>Tạo project</Button>
      <SmartFilterBar
        compact
        records={records}
        state={filter}
        onChange={setFilter}
        facets={["semester", "course", "class", "group", "status"]}
        primary={["class", "status"]}
        mobilePrimary={["status"]}
        facetValues={{status: Object.keys(projectStatusLabels)}}
        teaching
        statusTitle="Trạng thái project"
        statusGroup="Project"
        statusLabels={projectStatusLabels}
        searchPlaceholder="Tìm project hoặc nhóm..."
        noun="project"
        viewKey="projects"
      />
      <section className="flex flex-col gap-3">
        {visible.map((p) => {
          const ctx = resolveProjectAcademicContext(p, mgmt)
          const health = ctx.group ? groupHealthMeta[ctx.group.health] : undefined
          return (
            <Link key={p.id} to={`/projects/${p.id}`}>
              <Card className="transition hover:border-brand/40">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="min-w-0 text-[14px] text-muted">
                    {ctx.course?.code ?? "—"} · {ctx.cls?.code ?? "—"} · {ctx.group?.name ?? "—"}
                  </span>
                  <span className="flex max-w-full flex-wrap gap-1"><ProjectStateBadge state={p.state} />{p.state === "active" && health && <Badge tone={health.tone}>{health.label}</Badge>}</span>
                </div>
                <p className="text-[17px] leading-[1.45] font-semibold text-ink">{p.name}</p>
                <ProgressBar value={p.progress} label="Tiến độ project (ghi nhận)" />
                <p className="text-[12px] text-muted">Deadline {fmtDate(parseISO(p.deadline))}</p>
              </Card>
            </Link>
          )
        })}
        {!visible.length && (
          <EmptyState
            icon={<Folder size={24} className="text-brand" />}
            title="Chưa có project phù hợp"
            description="Chọn trạng thái khác hoặc xóa bộ lọc."
            action={
              <Button variant="secondary" onClick={() => setFilter({facets:{},q:""})}>
                Xóa bộ lọc
              </Button>
            }
          />
        )}
      </section>
      <ProjectFormModal open={creating} onClose={() => setCreating(false)} />
    </div>
  )
}
