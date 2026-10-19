import { Bell, Files } from "lucide-react"
import { Link } from "react-router-dom"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import { useNotifications } from "@/data/notificationStore"
import { useStudentContext } from "@/pages/student/useStudentContext"

export default function StudentMobileHeader() {
  const notifications = useNotifications()
  const ctx = useStudentContext()
  const student = ctx.student
  const hasUnread = notifications.some((n) => n.unread && n.projectId === ctx.project?.id)
  return (
    <header className="mobile-header w-full border-b border-line">
      <div className="mobile-header-inner gap-2 px-4 sm:px-5">
        <Link to="/student/dashboard" className="flex min-w-0 items-center gap-2.5 min-h-12 py-1">
          <Files size={24} strokeWidth={1.75} className="shrink-0 text-brand" />
          <span className="truncate text-[17px] font-semibold text-ink">Project Review</span>
          <Badge tone="olive">SV</Badge>
        </Link>
        <div className="flex-1" />
        {/* Minimum 48x48 dp touch target for notification button */}
        <Link
          to="/student/notifications"
          aria-label="Thông báo"
          className="relative flex size-12 items-center justify-center text-ink hover:text-brand transition"
        >
          <Bell size={20} strokeWidth={1.75} />
          {hasUnread && (
            <span className="absolute top-2.5 right-2.5 size-2.5 rounded-full border-2 border-white bg-rust" />
          )}
        </Link>
        {/* Minimum 48x48 dp touch target for profile link */}
        <Link to="/student/profile" aria-label="Tài khoản" className="flex size-12 items-center justify-center">
          <Avatar initials={student?.initials ?? "SV"} size={40} />
        </Link>
      </div>
    </header>
  )
}
