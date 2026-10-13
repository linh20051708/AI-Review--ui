import { Archive, ChevronRight, Pencil, RotateCcw, Trash2 } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import MoreMenu from "@/components/ui/MoreMenu"
import { useManagement } from "@/data/managementStore"
import { courseLabel } from "@/lib/academic"
import { scheduleLabel, sessionMeta } from "@/lib/time"
import type { ClassRoom } from "@/types"

interface Props {
  classRoom: ClassRoom
  onEdit: () => void
  onArchive: () => void
  onRestore: () => void
  onDelete: () => void
}

export default function ClassCard({ classRoom, onEdit, onArchive, onRestore, onDelete }: Props) {
  const { courses, semesters } = useManagement()
  const archived = classRoom.state === "archived"
  // Classes with students/projects keep their history: archive instead of delete.
  const hasData = classRoom.studentCount > 0 || classRoom.projectCount > 0
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[17px] font-semibold text-ink">{classRoom.code}</span>
        <div className="flex items-center gap-2">
          <Badge tone={archived ? "neutral" : "brand"}>{archived ? "Đã lưu trữ" : "Đang giảng dạy"}</Badge>
          <MoreMenu
            items={[
              archived
                ? { label: "Khôi phục lớp", icon: <RotateCcw size={16} strokeWidth={1.75} />, onSelect: onRestore }
                : { label: "Lưu trữ lớp", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: onArchive },
              ...(!hasData ? [{ label: "Xóa lớp", danger: true, icon: <Trash2 size={16} strokeWidth={1.75} />, onSelect: onDelete }] : []),
            ]}
          />
        </div>
      </div>
      <div className="leading-[1.45]">
        <p className="text-[14px] font-semibold text-ink">{courseLabel(courses.find((c) => c.id === classRoom.courseId))}</p>
        <p className="text-[12px] text-muted">{semesters.find((s) => s.id === classRoom.semesterId)?.name} · {scheduleLabel(classRoom.schedule)} · {sessionMeta[classRoom.session].label}</p>
      </div>
      <div className="grid grid-cols-3 gap-2 text-[12px] text-muted">
        <span>{classRoom.studentCount} sinh viên</span>
        <span>{classRoom.groupCount} nhóm</span>
        <span>{classRoom.projectCount} project</span>
      </div>
      <Badge tone={classRoom.pendingReviews > 0 ? "amber" : "neutral"}>{classRoom.pendingReviews} tài liệu chờ review</Badge>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={onEdit} icon={<Pencil size={16} strokeWidth={1.75} />}>Chỉnh sửa</Button>
        <Button to={`/classes/${classRoom.id}`} className="flex-row-reverse" icon={<ChevronRight size={18} strokeWidth={1.75} />}>Xem lớp</Button>
      </div>
    </Card>
  )
}
