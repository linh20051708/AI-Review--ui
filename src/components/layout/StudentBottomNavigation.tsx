import { Inbox, BookOpen, Folder, LayoutDashboard, UserRound } from "lucide-react"
import { NavLink } from "react-router-dom"

const tabs = [
  { to: "/student/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { to: "/student/projects", label: "Dự án", icon: Folder },
  { to: "/student/documents", label: "Tài liệu", icon: BookOpen },
  { to: "/student/notifications", label: "Thông báo", icon: Inbox },
  { to: "/student/profile", label: "Tài khoản", icon: UserRound },
]

export default function StudentBottomNavigation() {
  return (
    <nav aria-label="Điều hướng sinh viên" className="safe-bottom w-full shrink-0 border-t border-line bg-white">
      <ul className="flex gap-0.5 px-2 py-1.5">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex min-h-12 flex-col items-center justify-center gap-1 rounded-[8px] px-1 py-1 text-[10px] leading-tight transition-colors ${
                  isActive ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
                }`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              <span className="truncate">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
