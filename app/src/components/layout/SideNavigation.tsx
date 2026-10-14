import { Bell, BookOpen, CalendarRange, FileCheck2, Files, Folder, GraduationCap, History, LayoutDashboard, Library, ListChecks, School, Settings, Users, Users2 } from "lucide-react"
import { NavLink } from "react-router-dom"
import Badge from "@/components/ui/Badge"
import { useReviewStore } from "@/data/reviewStore"

const workspace = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/projects", label: "Project", icon: Folder },
  { to: "/reviews", label: "Yêu cầu review", icon: FileCheck2, count: true },
  { to: "/documents", label: "Tài liệu", icon: BookOpen },
  { to: "/review-history", label: "Lịch sử review", icon: History },
  { to: "/notifications", label: "Thông báo", icon: Bell },
]
const manage = [
  { to: "/semesters", label: "Học kỳ", icon: CalendarRange },
  { to: "/courses", label: "Môn học", icon: Library },
  { to: "/classes", label: "Lớp học", icon: School },
  { to: "/students", label: "Sinh viên", icon: GraduationCap },
  { to: "/groups", label: "Nhóm sinh viên", icon: Users },
  { to: "/rule-sets", label: "Bộ quy tắc", icon: ListChecks },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-12 items-center gap-2.5 rounded-[8px] px-3 py-2.5 text-[13px] font-medium transition-colors ${isActive ? "bg-brand-soft text-brand" : "text-ink hover:bg-subtle"}`

export default function SideNavigation() {
  const { requests } = useReviewStore()
  const waiting = requests.filter((r) => r.supervisorStatus === "waiting").length
  const Section = ({ title, items }: { title: string; items: typeof workspace }) => (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-[10px] font-semibold tracking-wide text-muted">{title}</p>
      {items.map(({ to, label, icon: Icon, count }) => (
        <NavLink key={to} to={to} className={linkClass}>
          <Icon size={18} strokeWidth={1.75} />
          <span className="flex-1">{label}</span>
          {count && waiting > 0 && <span className="rounded-full bg-brand px-1.5 text-[11px] leading-[18px] font-semibold text-white">{waiting}</span>}
        </NavLink>
      ))}
    </div>
  )
  return (
    <aside className="hidden w-[248px] shrink-0 flex-col border-r border-line bg-white lg:flex">
      <div className="flex h-[64px] items-center gap-2.5 border-b border-line px-5">
        <Files size={22} strokeWidth={1.75} className="text-brand" />
        <span className="text-[16px] font-semibold text-ink">Project Review</span>
        <Badge tone="olive">AI</Badge>
      </div>
      <nav aria-label="Điều hướng giảng viên" className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5">
        <Section title="KHÔNG GIAN LÀM VIỆC" items={workspace} />
        <Section title="QUẢN LÝ" items={manage} />
      </nav>
      <div className="flex flex-col gap-1 border-t border-line px-3 py-4">
        <div className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-ink">
          <span className="size-2 rounded-full bg-brand" />
          <span className="flex-1">Trạng thái hệ thống</span>
          <span className="text-[11px] text-muted">Ổn định</span>
        </div>
        <NavLink to="/profile" className={linkClass}>
          <Settings size={18} strokeWidth={1.75} />
          Cài đặt
        </NavLink>
      </div>
    </aside>
  )
}
