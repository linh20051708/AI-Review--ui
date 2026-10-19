import { obsoleteJoinApproval } from "@/data/selfServicePolicy"
import { contentText } from "@/components/ui/contentText"
import { ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"
import Card from "@/components/ui/Card"
import PageHeading from "@/components/ui/PageHeading"
import { notifications } from "@/data/mockData"

export default function NotificationsPage() {
  const visible = notifications.filter(n => !obsoleteJoinApproval(n))
  const unread = visible.filter((n) => n.unread).length
  return (
    <>
      <PageHeading eyebrow="CẬP NHẬT" title="Thông báo" description={`${unread} thông báo chưa đọc`} />
      <Card className="gap-0 py-1">
        <ul>
          {visible.map((n) => (
            <li key={n.id} className="border-b border-line last:border-b-0">
              <Link to={n.link ?? "/dashboard"} className="flex items-center gap-3 py-3">
                <span className={`size-2 shrink-0 rounded-full ${n.unread ? "bg-brand" : "bg-line"}`} />
                <span className="min-w-0 flex-1 leading-[1.45]">
                  <span className={`block text-[13px] text-ink ${n.unread ? "font-semibold" : ""}`}>{contentText(n.title)}</span>
                  <span className="block text-[12px] text-muted">{contentText(n.meta)}</span>
                </span>
                <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
