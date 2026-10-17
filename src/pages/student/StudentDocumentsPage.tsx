import { FileText } from "lucide-react"
import { Fragment, useState } from "react"
import { Link } from "react-router-dom"
import Badge from "@/components/ui/Badge"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import SegmentedTabs from "@/components/ui/SegmentedTabs"
import StatusBadge from "@/components/ui/StatusBadge"
import { fmtDate } from "@/lib/time"
import type { ProjectDocument } from "@/types"
import { useStudentContext } from "./useStudentContext"

const filters: { label: string; match: (d: ProjectDocument) => boolean }[] = [
  { label: "Tất cả", match: () => true },
  { label: "Chưa nộp", match: (d) => !d.latestVersion && !d.submissionLocked },
  { label: "Chờ review", match: (d) => d.supervisorStatus === "waiting" || d.supervisorStatus === "inReview" },
  { label: "Cần chỉnh sửa", match: (d) => d.supervisorStatus === "needsRevision" },
  { label: "Đã phê duyệt", match: (d) => d.supervisorStatus === "approved" },
  { label: "Không đạt", match: (d) => d.supervisorStatus === "notAccepted" },
]

export default function StudentDocumentsPage() {
  const ctx = useStudentContext()
  const [active, setActive] = useState(0)
  const { docs } = ctx
  const tabs = filters.map((f) => `${f.label} (${docs.filter(f.match).length})`)
  const visible = docs.filter(filters[active].match)

  return (
    <>
      <PageHeading
        eyebrow="TÀI LIỆU"
        title="Tài liệu của tôi"
        description={`${docs.length} tài liệu thuộc project ${ctx.project?.name ?? ""}`}
      />
      <SegmentedTabs id="student-docs" tabs={tabs} active={tabs[active]} onChange={(t) => setActive(tabs.indexOf(t))} />
      <div id="student-docs-tabpanel" role="tabpanel" aria-labelledby={`student-docs-tab-${tabs[active]}`}>
      <section className="flex flex-col gap-3">
        {visible.length ? (
          ctx.labs.map((lab) => <Fragment key={lab.id}>
            {visible.some((d) => d.lab.id === lab.id) && <h2 className="text-[16px] font-semibold">{lab.code} · {lab.title}</h2>}
            {visible.filter((d) => d.lab.id === lab.id).map((d) => {
            const dl = ctx.deadlineFor(d.id)
            return (
              <Link key={d.id} to={`/student/documents/${d.id}`}>
                <Card className="hover:border-brand/40">
                  <div className="flex items-center justify-between gap-3 text-[14px] text-muted">
                    <span>
                      {d.labCode} · {d.itemCode}
                    </span>
                    {dl.ts && <span className="shrink-0">Đến hạn {fmtDate(dl.ts)}</span>}
                  </div>
                  <p className="flex flex-wrap items-center gap-2 text-[16px] leading-[1.45] font-semibold text-ink">
                    <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
                    {d.title}
                    {d.latestVersion && <Badge>{d.latestVersion}</Badge>}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <StatusBadge status={d.supervisorStatus ?? d.documentStatus} />
                    {ctx.requestFor(d.reviewId) && <Badge tone="olive">{ctx.requestFor(d.reviewId)?.aiStatus === "aiReviewed" ? "AI đã review" : "AI chưa hoàn tất"}</Badge>}
                    {d.submissionLocked && <Badge tone="neutral">Khóa gửi review</Badge>}
                  </div>
                </Card>
              </Link>
            )
          })}</Fragment>)
        ) : (
          <EmptyState title="Không có tài liệu phù hợp" description="Thử chọn bộ lọc khác." />
        )}
      </section>
      </div>
    </>
  )
}
