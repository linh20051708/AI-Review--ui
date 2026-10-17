import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  GraduationCap,
  School,
  Sparkles,
  Users2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SmartFilterBar from "@/components/filters/SmartFilterBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeading from "@/components/ui/PageHeading";
import SectionHeader from "@/components/ui/SectionHeader";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { aiSummary, attentionItems, currentUser } from "@/data/mockData";
import { useManagement } from "@/data/managementStore";
import { useReviewStore } from "@/data/reviewStore";
import { requestRecords } from "@/data/filterRecords";
import { currentSemester } from "@/lib/academic";
import { filterRecords, type FilterState } from "@/lib/smartFilter";
import { fmtRelative } from "@/lib/time";
import type { ReviewRequest } from "@/types";

function ReviewRow({ r, cta }: { r: ReviewRequest; cta: string }) {
  return (
    <li className="flex flex-col gap-2.5 border-b border-line py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 leading-[1.45]">
        <p className="text-[12px] text-muted">
          {r.classCode} · {r.groupName} · {r.projectName}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <FileText
            size={16}
            strokeWidth={1.75}
            className="shrink-0 text-muted"
          />
          <span className="text-[14px] font-semibold text-ink">
            {r.documentTitle}
          </span>
          <Badge>{r.version}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-muted">
          <span>
            AI Review:{" "}
            <span
              className={r.ai.errors ? "font-semibold text-rust" : "text-ink"}
            >
              {r.aiStatus === "aiReviewing" ? "đang chạy" : aiSummary(r.ai)}
            </span>
          </span>
          <span>Yêu cầu: {fmtRelative(r.requestedTs)}</span>
          <StatusBadge status={r.supervisorStatus} />
        </div>
      </div>
      <Button
        to={`/reviews/${r.id}`}
        variant={cta === "Review ngay" ? "primary" : "secondary"}
        className="sm:w-auto sm:shrink-0"
      >
        {cta}
      </Button>
    </li>
  );
}

export default function DashboardPage() {
  const { requests: allRequests } = useReviewStore();
  const {
    classes: allClasses,
    semesters,
    courses,
    projects,
    offerings,
    groups,
    students,
  } = useManagement();
  const [filter, setFilter] = useState<FilterState>(() => ({
    facets: { semester: [currentSemester(semesters).id] },
    q: "",
  }));
  const records = useMemo(
    () => requestRecords(allRequests, allClasses, offerings),
    [allRequests, allClasses, offerings],
  );
  const requests = filterRecords(records, filter).map((r) => r.item);
  const sel = filter.facets;

  // Stats follow the same semester / course / class context.
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
  const attention = attentionItems.filter((a) => projectIds.has(a.projectId));
  const waiting = requests.filter((r) => r.supervisorStatus === "waiting");
  const inReview = requests.filter((r) => r.supervisorStatus === "inReview");
  // Mock: 4 further revision requests live in classes without seeded review requests.
  const needsRevision =
    requests.filter((r) => r.supervisorStatus === "needsRevision").length +
    (classes.some((c) => c.id === "se1701") ? 4 : 0);

  const stats = [
    { value: waiting.length, label: "Chờ tôi review" },
    { value: inReview.length, label: "Đang review" },
    { value: needsRevision, label: "Cần sinh viên chỉnh sửa" },
    {
      value: attention.filter(
        (a) => a.label === "Sắp đến hạn" || a.label === "Quá hạn",
      ).length,
      label: "Sắp đến deadline",
    },
    {
      value: classes.filter((c) => c.state === "active").length,
      label: "Lớp đang phụ trách",
    },
    {
      value: classes.reduce((n, c) => n + c.projectCount, 0),
      label: "Project đang hoạt động",
    },
  ];

  // Compact quick-access items near the top (min 48x48 touch target)
  const quickAccessItems = [
    {
      title: "Học kỳ",
      badge: semesters.length,
      icon: <Calendar size={18} className="text-brand shrink-0" />,
      path: "/semesters",
    },
    {
      title: "Môn học",
      badge: courses.length,
      icon: <BookOpen size={18} className="text-brand shrink-0" />,
      path: "/courses",
    },
    {
      title: "Lớp",
      badge: allClasses.length,
      icon: <School size={18} className="text-brand shrink-0" />,
      path: "/classes",
    },
    {
      title: "Sinh viên",
      badge: students.length,
      icon: <GraduationCap size={18} className="text-brand shrink-0" />,
      path: "/students",
    },
    {
      title: "Nhóm",
      badge: groups.length,
      icon: <Users2 size={18} className="text-brand shrink-0" />,
      path: "/groups",
    },
  ];

  return (
    <>
      {/* 1. Greeting + current Semester */}
      <div className="flex items-center justify-between gap-3 leading-[1.45]">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">
            Xin chào, {currentUser.name}
          </p>
          <p className="text-[12px] text-muted">{currentUser.role}</p>
        </div>
        <Badge>{currentUser.semester}</Badge>
      </div>

      {/* 2. Dashboard title + description */}
      <PageHeading
        eyebrow="TỔNG QUAN HỌC VỤ"
        title="Dashboard"
        description="Quản lý tiến độ review tài liệu đồ án và điều phối dữ liệu học vụ."
      />

      {/* 3. Search & Context Filters */}
      <SmartFilterBar
        records={records}
        state={filter}
        onChange={setFilter}
        facets={["semester", "course", "class"]}
        primary={["course", "class"]}
        searchPlaceholder="Tìm project, tài liệu..."
        noun="yêu cầu review trong phạm vi"
        viewKey="dashboard"
      />

      {/* 4. TRUY CẬP NHANH (Compact Quick Academic Access near the top) */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-muted">
            TRUY CẬP NHANH
          </h2>
          <span className="text-[11px] text-muted">Quản lý học vụ</span>
        </div>

        {/* Compact row on mobile (horizontal scroll or clean flex) with >=48x48dp touch targets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-5 sm:gap-2.5">
          {quickAccessItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className="
        flex min-h-14 min-w-[112px] shrink-0
        items-center justify-between gap-2
        rounded-[10px] border border-line bg-white
        px-3 py-2
        transition hover:border-brand/40 hover:bg-brand-soft/20
        active:scale-[0.98]
        sm:min-w-0
      "
            >
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-[6px] bg-brand-soft text-brand">
                  {item.icon}
                </div>

                <span className="whitespace-nowrap text-[14px] font-semibold text-ink">
                  {item.title}
                </span>
              </div>

              <span className="shrink-0 rounded-full bg-subtle px-1.5 py-0.5 text-[11px] font-semibold text-muted">
                {item.badge}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. VIỆC CẦN LÀM (Key Supervisor Actionable Stats) */}
      <section className="flex flex-col gap-2.5">
        <div className="px-0.5">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-muted">
            VIỆC CẦN LÀM
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* 6. TÀI LIỆU CẦN REVIEW */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Tài liệu cần review"
          meta={`${waiting.length} yêu cầu`}
          linkTo="/reviews"
        />
        {waiting.length ? (
          <Card className="gap-0 py-0.5">
            <ul>
              {waiting.map((r) => (
                <ReviewRow key={r.id} r={r} cta="Review ngay" />
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            title="Không còn tài liệu chờ review"
            description="Bạn đã xử lý tất cả yêu cầu."
          />
        )}
      </section>

      {/* 7. ĐANG REVIEW */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Đang review"
          meta={`${inReview.length} tài liệu`}
        />
        {inReview.length ? (
          <Card className="gap-0 py-0.5">
            <ul>
              {inReview.map((r) => (
                <ReviewRow key={r.id} r={r} cta="Tiếp tục review" />
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState title="Không có tài liệu đang review" />
        )}
      </section>

      {/* 8. PROJECT CẦN CHÚ Ý */}
      <section className="flex flex-col gap-3">
        <SectionHeader
          title="Project cần chú ý"
          meta={`${attention.length} project`}
        />
        <Card className="gap-0 py-1">
          <ul>
            {attention.map((item) => (
              <li
                key={item.title}
                className="border-b border-line last:border-b-0"
              >
                <Link
                  to={`/projects/${item.projectId}`}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 leading-[1.45]">
                    <Badge tone={item.tone}>{item.label}</Badge>
                    <p className="text-[14px] font-semibold text-ink">
                      {item.title}
                    </p>
                    <p className="text-[12px] text-muted">{item.detail}</p>
                  </div>
                  <ChevronRight
                    size={18}
                    strokeWidth={1.75}
                    className="shrink-0 text-muted"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </>
  );
}
