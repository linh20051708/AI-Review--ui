import "@/styles/phase-two.css"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SmartFilterBar from "@/components/filters/SmartFilterBar"
import ReviewListSkeleton from "@/components/review/ReviewListSkeleton"
import ReviewRequestCard from "@/components/review/ReviewRequestCard"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import StatusBadge from "@/components/ui/StatusBadge"
import ReviewAIStatus from "@/components/review/ReviewAIStatus"
import { compareReviewAI } from "@/lib/reviewPresentation"
import { requestRecords, reviewStatusLabels } from "@/data/filterRecords"
import { useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { isCompleted } from "@/data/selectors"
import { currentSemester } from "@/lib/academic"
import { filterRecords, restoreReviewView, type FilterState } from "@/lib/smartFilter"
import { fmtRelative, parseISO } from "@/lib/time"

const SORTS = ["Mới nhất", "Cũ nhất", "Hạn nộp gần nhất", "Chờ lâu nhất", "AI có lỗi nhiều nhất"]

export default function ReviewRequestsPage() {
  const { requests, evaluations } = useReviewStore()
  const { classes, semesters, courses, projects, offerings } = useManagement()

  // Waiting includes both first submissions and revisions; document state is separate.
  const actionable: FilterState = useMemo(
    () => ({ facets: { semester: [currentSemester(semesters).id], status: ["waiting"] }, q: "" }),
    [semesters]
  )
  const [filter, setFilter] = useState<FilterState>(actionable)
  const [sort, setSort] = useState(SORTS[0])
  const [loading, setLoading] = useState(false)

  const handleFilterChange = (nextFilter: FilterState) => {
    setLoading(true)
    setFilter(nextFilter)
    setTimeout(() => setLoading(false), 350)
  }

  const records = useMemo(() => requestRecords(requests, classes, offerings, evaluations), [requests, classes, offerings, evaluations])
  const deadline = (projectId: string) => parseISO(projects.find((p) => p.id === projectId)?.deadline ?? "2099-01-01")
  const items = filterRecords(records, filter)
    .map((r) => r.item)
    .sort((a, b) => {
      switch (sort) {
        case "Cũ nhất":
          return a.requestedTs - b.requestedTs
        case "Hạn nộp gần nhất":
          return deadline(a.projectId) - deadline(b.projectId)
        case "Chờ lâu nhất":
          return Number(isCompleted(a.supervisorStatus)) - Number(isCompleted(b.supervisorStatus)) || a.requestedTs - b.requestedTs
        case "AI có lỗi nhiều nhất":
          return compareReviewAI(a, b, evaluations)
        default:
          return b.requestedTs - a.requestedTs
      }
    })
  const isDefault = JSON.stringify(filter.facets) === JSON.stringify(actionable.facets)

  return (
    <div className="phase-two flex min-w-0 flex-col gap-4">
      <PageHeading
        title="Yêu cầu đánh giá"
        
        aside={
          isDefault ? (
            <button
              type="button"
              onClick={() => handleFilterChange({ facets: {}, q: filter.q })}
              className="inline-flex min-h-12 items-center px-2 text-[13px] font-semibold text-brand hover:underline"
            >
              Xem tất cả
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleFilterChange(actionable)}
              className="inline-flex min-h-12 items-center px-2 text-[13px] font-semibold text-brand hover:underline"
            >
              Việc cần làm
            </button>
          )
        }
      />
      <SmartFilterBar
        compact
        records={records}
        state={filter}
        onChange={handleFilterChange}
        facets={["semester", "course", "class", "lab", "labItem", "group", "project", "docType", "status", "documentStatus", "evaluationStatus", "ai", "legacyReviewStatus"]}
        primary={["class", "lab", "labItem"]}
        statusTitle="Giảng viên đánh giá"
        statusGroup="Trạng thái đánh giá"
        restoreView={restoreReviewView}
        time
        teaching
        statusLabels={reviewStatusLabels}
        searchPlaceholder="Tìm dự án, tài liệu, sinh viên..."
        noun="yêu cầu đánh giá"
        sort={{ options: SORTS, value: sort, onChange: setSort }}
        viewKey="reviews"
      />

      {loading ? (
        <ReviewListSkeleton count={3} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Không có yêu cầu phù hợp"
          description="Thử bỏ bớt bộ lọc hoặc chọn “Xem tất cả” để hiển thị toàn bộ tài liệu."
          action={
            <Button
              variant="secondary"
              onClick={() => handleFilterChange({ facets: {}, q: "" })}
              className="w-auto px-4"
            >
              Bỏ bộ lọc
            </Button>
          }
        />
      ) : (
        <>
          <section className="flex flex-col gap-3 lg:hidden">
            {items.map((r) => (
              <ReviewRequestCard key={r.id} review={r} compact />
            ))}
          </section>
          <div className="hidden overflow-x-auto rounded-[12px] border border-line bg-white lg:block">
            <table className="w-full text-left text-[13px] leading-[1.45]">
              <thead className="border-b border-line bg-subtle text-[12px] text-muted">
                <tr>
                  {["Thời gian", "Môn · Lớp", "Nhóm", "Dự án", "Tài liệu", "Phiên bản", "Đánh giá AI", "Trạng thái", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-b-0 hover:bg-subtle/50">
                    <td className="px-3 py-3 whitespace-nowrap text-muted" title={r.requestedAt}>
                      {fmtRelative(r.requestedTs)}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-ink">
                      <span className="text-muted">{courses.find((c) => c.id === r.courseId)?.code} · </span>
                      {r.classCode}

                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-ink">{r.groupName}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{r.projectName}</td>
                    <td className="px-3 py-3 text-ink">{r.documentTitle}</td>
                    <td className="px-3 py-3">
                      <Badge>{r.version}</Badge>
                    </td>
                    <td className="px-3 py-3">
                      <ReviewAIStatus review={r} />
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={r.supervisorStatus} />
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Link
                        to={`/reviews/${r.id}`}
                        className={`inline-flex min-h-12 items-center rounded-[8px] px-3.5 text-[13px] font-semibold transition active:scale-95 ${
                          isCompleted(r.supervisorStatus)
                            ? "border border-line bg-white text-ink hover:bg-subtle"
                            : "border border-brand bg-brand text-white hover:bg-brand-hover"
                        }`}
                      >
                        {isCompleted(r.supervisorStatus) ? "Xem" : "Đánh giá"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
