import { obsoleteJoinApproval } from "@/data/selfServicePolicy"
import { contentText } from "@/components/ui/contentText"
import { useMemo, useState } from "react"
import { ArrowRight, BadgeCheck, Bell, Clock, FileUp } from "lucide-react"
import { Link } from "react-router-dom"
import PageHeading from "@/components/ui/PageHeading"
import SegmentedTabs from "@/components/ui/SegmentedTabs"
import type { NotificationKind } from "@/data/mockData"
import { notifications } from "@/data/mockData"

const FILTERS = ["Tất cả", "Chưa đọc", "Review", "Deadline", "AI Review"]

const ICONS: Record<NotificationKind, typeof FileUp> = {
  "file-up": FileUp,
  "badge-check": BadgeCheck,
  clock: Clock,
  bell: Bell,
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState("Tất cả")

  const visible = notifications.filter(n => !obsoleteJoinApproval(n))
  const unread = visible.filter((n) => n.unread).length

  const matches = (n: (typeof notifications)[number]) => {
    if (filter === "Tất cả") return true
    if (filter === "Chưa đọc") return n.unread
    if (filter === "Review") return n.kind === "file-up" || n.kind === "badge-check"
    if (filter === "AI Review") return n.title.includes("AI Review")
    if (filter === "Deadline") return n.kind === "clock"
    return true
  }

  const sections = useMemo(() => {
    const map = new Map<string, typeof notifications>()
    for (const n of visible) {
      if (!matches(n)) continue
      const list = map.get(n.section) ?? []
      list.push(n)
      map.set(n.section, list)
    }
    return [...map.entries()]
  }, [filter])

  return (
    <>
      <PageHeading eyebrow="CẬP NHẬT" title="Thông báo" description={`${unread} thông báo chưa đọc`} />

      <SegmentedTabs id="notif" tabs={FILTERS} active={filter} onChange={setFilter} />

      <div id="notif-tabpanel" role="tabpanel" aria-labelledby={`notif-tab-${filter}`} className="flex flex-col gap-6">
        {sections.map(([section, items]) => (
          <section key={section} className="flex flex-col gap-3">
            <h2 className="text-[18px] leading-[1.18] font-semibold text-ink">{section}</h2>
            <ul className="flex flex-col gap-3">
              {items.map((n) => {
                const Icon = ICONS[n.kind]
                return (
                  <li key={n.id}>
                    <Link
                      to={n.link ?? "/dashboard"}
                      className={`flex items-start gap-3 rounded-[12px] border border-line p-4 ${n.unread ? "bg-brand-tint" : "bg-white"}`}
                    >
                      <span className="grid size-[34px] shrink-0 place-items-center rounded-[8px] bg-brand-soft text-brand">
                        <Icon size={18} strokeWidth={1.75} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-2">
                        <span className="flex items-start gap-2">
                          {n.unread && <span className="mt-[6px] size-[7px] shrink-0 rounded-full bg-brand" />}
                          <span className={`text-[14px] leading-[1.45] text-ink ${n.unread ? "font-semibold" : ""}`}>{contentText(n.title)}</span>
                        </span>
                        <span className="text-[14px] leading-[1.45] text-muted">{contentText(n.meta)}</span>
                        <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-brand">
                          Xem chi tiết
                          <ArrowRight size={13} strokeWidth={2} />
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>


    </>
  )
}
