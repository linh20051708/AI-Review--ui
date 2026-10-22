import { Plus, School } from "lucide-react"
import { useMemo, useState } from "react"
import SmartFilterBar from "@/components/filters/SmartFilterBar"
import ClassCard from "@/components/project/ClassCard"
import ClassFormModal from "@/components/project/ClassFormModal"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import ConfirmModal from "@/components/ui/ConfirmModal"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import { toast } from "@/components/ui/Toast"
import { updateManagement, useManagement } from "@/data/managementStore"
import { classRecords } from "@/data/filterRecords"
import { currentSemester } from "@/lib/academic"
import { filterRecords, type FilterState } from "@/lib/smartFilter"
import type { ClassRoom } from "@/types"

export default function ClassListPage() {
  const { classes, semesters } = useManagement()
  const [filter, setFilter] = useState<FilterState>(() => ({ facets: { semester: [currentSemester(semesters).id], status: ["active"] }, q: "" }))
  const records = useMemo(() => classRecords(classes), [classes])
  const [form, setForm] = useState<{ open: boolean; classRoom?: ClassRoom }>({ open: false })
  const [archiving, setArchiving] = useState<ClassRoom | null>(null)
  const visible = filterRecords(records, filter).map((r) => r.item)
  const setState = (id: string, state: ClassRoom["state"]) => updateManagement((s) => ({ classes: s.classes.map((c) => (c.id === id ? { ...c, state } : c)) }))

  return (
    <>
      <PageHeading eyebrow="QUẢN LÝ LỚP HỌC" title="Lớp của tôi" description="Thêm sinh viên trong trang chi tiết của từng lớp." />
      <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setForm({ open: true })}>Tạo lớp</Button>
      <SmartFilterBar
        records={records}
        state={filter}
        onChange={setFilter}
        facets={["semester", "course", "status"]}
        primary={["course", "status"]}
        teaching
        statusTitle="Trạng thái lớp"
        statusGroup="Lớp"
        statusLabels={{ active: "Đang giảng dạy", archived: "Đã lưu trữ" }}
        searchPlaceholder="Tìm lớp..."
        noun="lớp"
        viewKey="classes"
      />
      <section className="flex flex-col gap-3">
        {visible.map((c) => (
          <ClassCard
            key={c.id}
            classRoom={c}
            onEdit={() => setForm({ open: true, classRoom: c })}
            onArchive={() => setArchiving(c)}
            onRestore={() => {
              setState(c.id, "active")
              toast(`Đã khôi phục lớp ${c.code}`)
            }}
            onDelete={() => {
              updateManagement((s) => ({ classes: s.classes.filter((x) => x.id !== c.id) }))
              toast(`Đã xóa lớp ${c.code}`)
            }}
          />
        ))}
        {!visible.length && (
          <EmptyState
            icon={<School size={24} className="text-brand" />}
            title="Chưa có lớp nào"
            description="Tạo lớp học đầu tiên cho học kỳ để bắt đầu tiếp nhận sinh viên và giao bài."
            action={
              <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setForm({ open: true })}>
                Tạo lớp
              </Button>
            }
          />
        )}
      </section>
      <ClassFormModal open={form.open} classRoom={form.classRoom} onClose={() => setForm({ open: false })} />
      <ConfirmModal
        open={Boolean(archiving)}
        title="Lưu trữ lớp"
        description={archiving ? `${archiving.code} · ${semesters.find((x) => x.id === archiving.semesterId)?.name}` : ""}
        confirmLabel="Lưu trữ lớp"
        onConfirm={() => {
          if (!archiving) return
          setState(archiving.id, "archived")
          toast(`Đã lưu trữ lớp ${archiving.code}`)
        }}
        onClose={() => setArchiving(null)}
      >
        <Notice>Lớp sẽ chuyển sang chỉ đọc. Nhóm, dự án, tài liệu và lịch sử đánh giá được giữ nguyên.</Notice>
      </ConfirmModal>
    </>
  )
}
