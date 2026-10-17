import { Lock } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import SmartFilterBar from "@/components/filters/SmartFilterBar"
import TimelineItem from "@/components/review/TimelineItem"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import { requestRecords, reviewStatusLabels } from "@/data/filterRecords"
import { useManagement } from "@/data/managementStore"
import { useReviewStore } from "@/data/reviewStore"
import { filterRecords, type FilterState } from "@/lib/smartFilter"
import { parseVN } from "@/lib/time"

export default function ReviewHistoryIndexPage() {
  const { audit, requests } = useReviewStore()
  const { classes, courses, offerings } = useManagement()
  const [filter, setFilter] = useState<FilterState>({ facets: {}, q: "" })
  // Only requests with audit events; time filter uses the latest event.
  const records = useMemo(() => {
    const withEvents = requests.filter((r) => audit.some((e) => e.reviewId === r.id))
    return requestRecords(withEvents, classes, offerings).map((rec) => {
      const events = audit.filter((e) => e.reviewId === rec.item.id)
      return { ...rec, ts: parseVN(events.at(-1)!.time) }
    })
  }, [audit, requests, classes, offerings])
  const visible = filterRecords(records, filter).sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))

  return (
    <>
      <PageHeading eyebrow="AUDIT TRAIL" title="Lịch sử review" description="Nhật ký chỉ đọc của mọi lần nộp, AI Review, feedback và quyết định." />
      <SmartFilterBar
        records={records}
        state={filter}
        onChange={setFilter}
        facets={["semester", "course", "class", "group", "project", "docType", "status"]}
        primary={["course", "class", "docType"]}
        time
        statusLabels={reviewStatusLabels}
        searchPlaceholder="Tìm project, tài liệu..."
        noun="tài liệu có lịch sử"
        viewKey="history"
      />
      <p className="inline-flex items-center gap-1.5 text-[12px] text-muted"><Lock size={13} strokeWidth={1.75} />Sự kiện không thể chỉnh sửa hoặc xóa.</p>
      {visible.map(({ item: r }) => {
        const events = audit.filter((e) => e.reviewId === r.id)
        return (
          <Card key={r.id}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 leading-[1.45]">
                <p className="truncate text-[12px] text-muted">{courses.find((c) => c.id === r.courseId)?.code} · {r.classCode} · {r.groupName} · {r.projectName}</p>
                <p className="text-[15px] font-semibold text-ink">{r.documentTitle} {r.version}</p>
              </div>
              <Link to={`/reviews/${r.id}/history`} className="-my-2 shrink-0 px-2 py-2 text-[12px] font-semibold text-brand">Chi tiết</Link>
            </div>
            <ol>{events.slice(-3).map((e, i, arr) => <TimelineItem key={e.id} event={e} last={i === arr.length - 1} />)}</ol>
          </Card>
        )
      })}
      {!visible.length && <EmptyState title="Không có lịch sử phù hợp" />}
    </>
  )
}
