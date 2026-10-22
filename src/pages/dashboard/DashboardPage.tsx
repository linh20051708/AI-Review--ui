import { projectStateMeta } from "@/data/projectStatuses";
import ReviewAIStatus from "@/components/review/ReviewAIStatus";
import { ChevronRight, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SmartFilterBar from "@/components/filters/SmartFilterBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { attentionItems, currentUser } from "@/data/mockData";
import { useSession } from "@/app/auth";
import { useManagement } from "@/data/managementStore";
import { useReviewStore } from "@/data/reviewStore";
import { requestRecords } from "@/data/filterRecords";
import { currentSemester } from "@/lib/academic";
import { filterRecords, type FilterState } from "@/lib/smartFilter";
import { fmtRelative } from "@/lib/time";
import type { ReviewRequest } from "@/types";
import "@/styles/review-refinement.css";

function ReviewRow({ review }: { review: ReviewRequest }) {
  return (
    <li className="border-b border-line last:border-0">
      <Link
        to={`/reviews/${review.id}`}
        className="flex min-h-12 items-center gap-3 py-4"
      >
        <FileText
          size={18}
          className="shrink-0 text-muted"
          aria-hidden="true"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-[14px] leading-[1.45]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{review.documentTitle}</span>
            <Badge>{review.version}</Badge>
          </div>
          <p className="break-words">{review.projectName}</p>
          <p className="text-muted">
            {review.classCode} · {review.groupName}
          </p>
          <p className="text-muted">
            <ReviewAIStatus review={review} />
          </p>
          <p className="text-muted">{fmtRelative(review.requestedTs)}</p>
        </div>
        <ChevronRight
          size={20}
          className="shrink-0 text-muted"
          aria-hidden="true"
        />
      </Link>
    </li>
  );
}

export default function DashboardPage() {
  const session = useSession();
  const user = session?.role === "supervisor" ? currentUser : undefined;
  const displayName = user?.name?.trim() || "Giảng viên";
  const roleLabel = user?.role?.trim() || "Giảng viên";
  const { requests: allRequests, evaluations } = useReviewStore();
  const {
    classes: allClasses,
    semesters,
    courses,
    projects,
    offerings,
    groups,
    students,
    registrations = [],
  } = useManagement();
  const [filter, setFilter] = useState<FilterState>(() => ({
    facets: { semester: [currentSemester(semesters).id] },
    q: "",
  }));
  const records = useMemo(
    () => requestRecords(allRequests, allClasses, offerings, evaluations),
    [allRequests, allClasses, offerings, evaluations],
  );
  const requests = filterRecords(records, filter).map((r) => r.item);
  const sel = filter.facets;
  const classes = allClasses.filter(
    (c) =>
      (!sel.semester?.length || sel.semester.includes(c.semesterId)) &&
      (!sel.course?.length || sel.course.includes(c.courseId)) &&
      (!sel.class?.length || sel.class.includes(c.id)),
  );
  const projectIds = new Set(
    projects
      .filter((p) =>
        classes.some(
          (c) => c.id === groups.find((g) => g.id === p.groupId)?.classId,
        ),
      )
      .map((p) => p.id),
  );
  const activeProjectCount = projects.filter(p => projectIds.has(p.id) && p.state === "active").length;
  const archivedProjectCount = projects.filter(p => projectIds.has(p.id) && p.state === "archived").length;
  const attention = attentionItems.filter((a) => projectIds.has(a.projectId) && projects.some(p => p.id === a.projectId && p.state === "active"));
  const waiting = requests.filter((r) => r.supervisorStatus === "waiting");
  const inReview = requests.filter((r) => r.supervisorStatus === "inReview");
  const pendingRegistrations = registrations.filter(
    (r) => r.status === "pending" && classes.some(c => c.id === groups.find(g => g.id === r.groupId)?.classId),
  ).length;
  const trackedClasses = classes.filter(c => c.state === "active");
  const projectsToHandle = new Set([
    ...waiting.map(r => r.projectId),
    ...inReview.map(r => r.projectId),
    ...attention.map(a => a.projectId),
  ].filter(id => projects.some(p => p.id === id && p.state === "active"))).size;
  const stats = [
    { label: "Môn học quản lý", value: new Set(trackedClasses.map(c => c.courseId)).size },
    { label: "Lớp đang theo dõi", value: trackedClasses.length },
    { label: "Tài liệu chờ đánh giá", value: waiting.length },
    { label: "Tài liệu đang đánh giá", value: inReview.length },
    { label: "Đăng ký chờ phản hồi", value: pendingRegistrations },
    { label: "Dự án cần xử lý", value: projectsToHandle },
  ];
  const needsRevision = requests.filter(r => r.supervisorStatus === "needsRevision").length;
  const academicLinks = [
    { label: "Học kỳ", count: semesters.length, to: "/semesters" },
    { label: "Môn học", count: courses.length, to: "/courses" },
    { label: "Lớp", count: allClasses.length, to: "/classes" },
    { label: "Sinh viên", count: students.length, to: "/students" },
    { label: "Nhóm", count: groups.length, to: "/groups" },
    { label: "Bộ quy tắc", to: "/rule-sets" },
  ];
  return (
    <div className="phase-one flex min-w-0 flex-col gap-4 text-[14px]">
      <header className="flex flex-col gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="break-words text-[16px] font-medium leading-snug text-ink">
            Xin chào, {displayName}
          </p>
          <p className="text-[14px] leading-snug text-muted">{roleLabel}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-[26px] font-semibold leading-tight">
            Tổng quan
          </h1>
          <label className="min-w-0">
            <span className="sr-only">Học kỳ đang xem</span>
            <select
              className="min-h-12 max-w-full rounded-lg border border-line bg-white px-3 text-[14px]"
              value={filter.facets.semester?.[0] ?? ""}
              onChange={(e) =>
                setFilter((s) => ({
                  ...s,
                  facets: {
                    ...s.facets,
                    semester: e.target.value ? [e.target.value] : [],
                  },
                }))
              }
            >
              <option value="">Tất cả học kỳ</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <section aria-label="Thống kê tổng quan" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </section>
      <Button to="/reviews">Mở đánh giá</Button>
      <section aria-labelledby="priority-title" className="flex flex-col gap-2">
        <h2 id="priority-title" className="text-[16px] font-semibold">
          Việc cần làm
        </h2>
        {waiting.length ? (
          <>
            <Card className="gap-0 py-0">
              <ul>
                {waiting.slice(0, 3).map((r) => (
                  <ReviewRow key={r.id} review={r} />
                ))}
              </ul>
            </Card>
            <Link
              to="/reviews"
              className="flex min-h-12 items-center justify-between font-semibold text-brand"
            >
              Xem {waiting.length} yêu cầu
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
            {waiting.length > 3 && (
              <details className="refinement-details">
                <summary>Yêu cầu khác ({waiting.length - 3})</summary>
                <ul>
                  {waiting.slice(3).map((r) => (
                    <ReviewRow key={r.id} review={r} />
                  ))}
                </ul>
              </details>
            )}
          </>
        ) : (
          <EmptyState title="Không còn tài liệu chờ đánh giá" />
        )}
      </section>
      <Link
        to="/project-registrations"
        className="flex min-h-12 items-center justify-between gap-3 border-y border-line py-3 font-semibold"
      >
        <span>Đăng ký dự án</span>
        <span className="flex items-center gap-2">
          <Badge tone={pendingRegistrations ? "amber" : "neutral"}>
            {pendingRegistrations} chờ duyệt
          </Badge>
          <ChevronRight size={18} aria-hidden="true" />
        </span>
      </Link>
      <details className="refinement-details">
        <summary>Đang đánh giá ({inReview.length})</summary>
        {inReview.length ? (
          <ul>
            {inReview.map((r) => (
              <ReviewRow key={r.id} review={r} />
            ))}
          </ul>
        ) : (
          <p className="py-3 text-muted">Không có tài liệu đang đánh giá.</p>
        )}
      </details>
      <details className="refinement-details">
        <summary>Truy cập nhanh</summary>
        <dl className="grid grid-cols-2 gap-3 border-b border-line py-4">
          <div>
            <dt className="text-muted">Lớp phụ trách</dt>
            <dd className="font-semibold">
              {classes.filter((c) => c.state === "active").length}
            </dd>
          </div>
          <div>
            <dt className="text-muted">{projectStateMeta.active.label}</dt>
            <dd className="font-semibold">
              {activeProjectCount}
            </dd>
          </div>
          <div><dt className="text-muted">{projectStateMeta.archived.label}</dt><dd className="font-semibold">{archivedProjectCount}</dd></div>
          <div>
            <dt className="text-muted">Chờ sinh viên sửa</dt>
            <dd className="font-semibold">{needsRevision}</dd>
          </div>
          <div>
            <dt className="text-muted">Sắp đến hạn nộp</dt>
            <dd className="font-semibold">
              {
                attention.filter(
                  (a) => a.label === "Sắp đến hạn" || a.label === "Quá hạn",
                ).length
              }
            </dd>
          </div>
        </dl>
        <nav aria-label="Quản lý học vụ" className="divide-y divide-line">
          {academicLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex min-h-12 items-center justify-between gap-3 py-3"
            >
              <span>{item.label}</span>
              <span className="flex items-center gap-2 text-muted">
                {item.count}
                <ChevronRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </nav>
      </details>
      <details className="refinement-details">
        <summary>Dự án cần chú ý ({attention.length})</summary>
        <ul className="divide-y divide-line">
          {attention.map((item) => (
            <li key={item.title}>
              <Link
                to={`/projects/${item.projectId}`}
                className="flex min-h-12 items-center gap-3 py-4"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <span>
                    <Badge tone={item.tone}>{item.label}</Badge>
                  </span>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-muted">{item.detail}</p>
                </div>
                <ChevronRight
                  size={18}
                  className="shrink-0"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </details>
      <details className="refinement-details">
        <summary>Tìm kiếm & phạm vi</summary>
        <div className="pt-3">
          <SmartFilterBar
            records={records}
            state={filter}
            onChange={setFilter}
            facets={["semester", "course", "class"]}
            primary={["course", "class"]}
            searchPlaceholder="Tìm dự án, tài liệu..."
            noun="yêu cầu đánh giá trong phạm vi"
            viewKey="dashboard"
          />
        </div>
      </details>
    </div>
  );
}
