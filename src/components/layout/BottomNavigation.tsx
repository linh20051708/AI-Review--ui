import { Bell, FileCheck2, Folder, LayoutDashboard, UserRound } from "lucide-react"
import { NavLink } from "react-router-dom"

const tabs = [
  { to: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, extra: [] as string[] },
  { to: "/projects", label: "Project", icon: Folder, extra: ["/classes", "/groups", "/semesters", "/documents", "/rule-sets", "/courses"] },
  { to: "/reviews", label: "Review", icon: FileCheck2, extra: ["/review-history"] },
  { to: "/notifications", label: "Thông báo", icon: Bell, extra: [] },
  { to: "/profile", label: "Tài khoản", icon: UserRound, extra: [] },
]

export default function BottomNavigation({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Điều hướng chính" className="safe-bottom w-full shrink-0 border-t border-line bg-white lg:hidden">
      <ul className="flex gap-0.5 px-2 py-1.5">
        {tabs.map(({ to, label, icon: Icon, extra }) => {
          const alsoActive = extra.some((p) => pathname.startsWith(p))
          return (
            <li key={to} className="min-w-0 flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  `flex min-h-12 flex-col items-center justify-center gap-1 rounded-[8px] px-1 py-1 text-[11px] font-semibold leading-tight transition-colors ${
                    isActive || alsoActive ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
