import { Bell, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import PageHeading from "@/components/ui/PageHeading"
import { notificationActions, useNotifications } from "@/data/notificationStore"
import { useStudentContext } from "./useStudentContext"

export default function StudentNotificationsPage() {
  const allNotifications = useNotifications()
  const ctx = useStudentContext()
  const notifications = allNotifications.filter((n) => n.projectId === ctx.project?.id)
  const unread = notifications.filter((n) => n.unread).length

  const resolveLink = (projectId?: string, documentTitle?: string, documentId?: string) => {
    if (documentTitle) {
      const doc = ctx.docs.find((d) => documentId ? d.id === documentId : d.title === documentTitle)
      if (doc) return `/student/documents/${doc.id}`
    }
    return projectId ? "/student/projects" : "/student/projects"
  }

  return (
    <>
      <PageHeading
        eyebrow="CẬP NHẬT"
        title="Thông báo"
        description={`${unread} thông báo chưa đọc`}
        aside={
          unread > 0 ? (
            <button
              type="button"
              onClick={() => notifications.filter((n) => n.unread).forEach((n) => notificationActions.markRead(n.id))}
              className="inline-flex min-h-12 items-center px-2 text-[14px] font-semibold text-brand hover:underline"
            >
              Đánh dấu đã đọc
            </button>
          ) : undefined
        }
      />
      <Card className="gap-0 py-1">
        {notifications.length ? (
          <ul>
            {notifications.map((n) => (
              <li key={n.id} className="border-b border-line last:border-b-0">
                <Link
                  to={resolveLink(n.projectId, n.documentTitle, n.documentId)}
                  onClick={() => notificationActions.markRead(n.id)}
                  className="flex items-center gap-3 py-3"
                >
                  <span className={`size-2 shrink-0 rounded-full ${n.unread ? "bg-brand" : "bg-line"}`} />
                  <span className="min-w-0 flex-1 leading-[1.45]">
                    <span className={`block text-[14px] text-ink ${n.unread ? "font-semibold" : ""}`}>{n.title}</span>
                    <span className="block text-[14px] text-muted">{n.meta}</span>
                  </span>
                  <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<Bell size={24} className="text-brand" />} title="Không có thông báo" />
        )}
      </Card>
    </>
  )
}
