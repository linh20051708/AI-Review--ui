import { Link, useParams } from "react-router-dom"
import BackLink from "@/components/ui/BackLink"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import { useManagement } from "@/data/managementStore"
import { offeringLabel } from "@/lib/config"
import RuleSetListPage from "./RuleSetListPage"

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const cfg = useManagement()
  const course = cfg.courses.find((c) => c.id === courseId)
  if (!course) return <EmptyState title="Không tìm thấy môn học" />
  const offerings = cfg.offerings.filter((o) => o.courseId === course.id)
  return (
    <div className="phase-two flex min-w-0 flex-col gap-4">
      <BackLink label="Môn học" fallback="/courses" />
      <PageHeading eyebrow={course.code} title={course.name} />
      <RuleSetListPage key={course.id} courseId={course.id} />
      <details className="border-b border-line pb-2">
        <summary className="font-semibold">
          Đợt học, lớp và nội dung riêng ({offerings.length})
        </summary>
        <p className="text-muted">
          Lớp kế thừa cấu hình môn học theo đợt. Hạn nộp và nội dung riêng được
          giữ theo cấu hình lớp.
        </p>
        <div className="divide-y divide-line">
          {offerings.map((o) => (
            <Link
              key={o.id}
              to={`/course-offerings/${o.id}`}
              className="flex min-h-12 items-center justify-between gap-3 py-2 text-brand"
            >
              <span>{offeringLabel(o, cfg.courses, cfg.semesters)}</span>
              <span>Cấu hình</span>
            </Link>
          ))}
          {!offerings.length && (
            <Link
              to="/courses"
              className="flex min-h-12 items-center text-brand"
            >
              Mở đợt học để áp dụng bộ quy tắc
            </Link>
          )}
        </div>
      </details>
    </div>
  )
}
