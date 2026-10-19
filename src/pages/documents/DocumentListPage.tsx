import { FileText } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SmartFilterBar from "@/components/filters/SmartFilterBar"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import StatusBadge from "@/components/ui/StatusBadge"
import { docStatusLabels, documentRecord } from "@/data/filterRecords"
import { resolveProjectAcademicContext } from "@/lib/config"
import { useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { documentsFor } from "@/data/selectors"
import { currentSemester } from "@/lib/academic"
import { filterRecords, type FilterState } from "@/lib/smartFilter"

/** Read-only index of logical documents across projects. */
export default function DocumentListPage() {
  const mgmt = useManagement()
  const { projects, classes, semesters, offerings, groups } = mgmt
  const { requests } = useReviewStore()
  const [filter, setFilter] = useState<FilterState>(() => ({ facets: { semester: [currentSemester(semesters).id] }, q: "" }))
  const records = useMemo(
    () =>
      projects.flatMap((p) =>
        documentsFor(p, requests, { classes, offerings, groups })
          .filter((d) => d.latestVersion || d.documentStatus === "draft")
          .map((d) => documentRecord({ ...d, supervisorStatus: requests.find((r) => r.id === d.reviewId)?.supervisorStatus ?? d.supervisorStatus }, p, groups, classes)),
      ),
    [projects, requests, classes, offerings, groups],
  )
  const visible = filterRecords(records, filter)

  return (
    <>
      <PageHeading eyebrow="KHÔNG GIAN LÀM VIỆC" title="Tài liệu"  />
      <SmartFilterBar
        records={records}
        state={filter}
        onChange={setFilter}
        facets={["semester", "course", "class", "lab", "labItem", "group", "project", "docType", "status", "documentStatus"]}
        primary={["class", "lab", "labItem"]}
        teaching
        statusTitle="Tiến độ tài liệu"
        statusGroup="Tài liệu"
        statusLabels={docStatusLabels}
        searchPlaceholder="Tìm tài liệu hoặc project..."
        noun="tài liệu"
        viewKey="documents"
      />
      <Card className="gap-0 py-0.5">
        <ul>
          {visible.map(({ item: d, project }) => {
            const p = projects.find((x) => x.id === project)!
            return (
              <li key={`${p.id}-${d.id}`} className="border-b border-line last:border-b-0">
                <Link to={d.reviewId ? `/reviews/${d.reviewId}` : `/projects/${p.id}/documents`} className="flex items-center gap-3 py-3">
                  <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
                  <div className="min-w-0 flex-1 leading-[1.45]">
                    <p className="flex flex-wrap items-center gap-1.5 text-[14px] font-semibold text-ink">{d.title} {d.latestVersion && <Badge>{d.latestVersion}</Badge>}</p>
                    <p className="truncate text-[12px] text-muted">{(() => { const ctx = resolveProjectAcademicContext(p, mgmt); return `${ctx.course?.code ?? "—"} · ${ctx.cls?.code ?? "—"} · ${ctx.group?.name ?? "—"} · ${p.name}` })()}</p>
                  </div>
                  {d.supervisorStatus ? <StatusBadge status={d.supervisorStatus} /> : d.submissionLocked ? <StatusBadge status="submissionLocked" /> : <StatusBadge status={d.documentStatus} />}
                </Link>
              </li>
            )
          })}
        </ul>
        {!visible.length && <div className="py-3"><EmptyState title="Không có tài liệu phù hợp" /></div>}
      </Card>
    </>
  )
}
