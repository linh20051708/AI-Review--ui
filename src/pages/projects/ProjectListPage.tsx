import { Folder, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SmartFilterBar from "@/components/filters/SmartFilterBar"
import ProjectFormModal from "@/components/project/ProjectFormModal"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import ProgressBar from "@/components/ui/ProgressBar"
import { groupHealthMeta } from "@/data/mockData"
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
    <>
      <PageHeading eyebrow="QUẢN LÝ PROJECT" title="Project" description="Project theo Học kỳ → Môn học → Lớp → Nhóm." />
      <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setCreating(true)}>Tạo project</Button>
      <SmartFilterBar
        records={records}
        state={filter}
        onChange={setFilter}
        facets={["semester", "course", "class", "group", "status"]}
        primary={["course", "class", "status"]}
        teaching
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
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-[12px] text-muted">
                    {ctx.course?.code ?? "—"} · {ctx.cls?.code ?? "—"} · {ctx.group?.name ?? "—"}
                  </span>
                  {p.state === "archived" ? <Badge>Đã lưu trữ</Badge> : health && <Badge tone={health.tone}>{health.label}</Badge>}
                </div>
                <p className="text-[17px] leading-[1.45] font-semibold text-ink">{p.name}</p>
                <ProgressBar value={p.progress} label="Tiến độ tài liệu" />
                <p className="text-[12px] text-muted">{ctx.semester?.name ?? "—"} · <span title={ctx.teachingMethod.source}>{ctx.teachingMethod.value ?? "Chưa cấu hình"}</span> · Deadline {fmtDate(parseISO(p.deadline))}</p>
              </Card>
            </Link>
          )
        })}
        {!visible.length && (
          <EmptyState
            icon={<Folder size={24} className="text-brand" />}
            title="Chưa có project phù hợp"
            description="Tạo project đầu tiên cho nhóm sinh viên hoặc bỏ bớt các tiêu chí lọc."
            action={
              <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setCreating(true)}>
                Tạo project
              </Button>
            }
          />
        )}
      </section>
      <ProjectFormModal open={creating} onClose={() => setCreating(false)} />
    </>
  )
}
