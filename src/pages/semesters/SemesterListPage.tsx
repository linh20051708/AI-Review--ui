import { Archive, CalendarRange, ChevronRight, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import ConfirmModal from "@/components/ui/ConfirmModal"
import { Field, TextArea, TextInput } from "@/components/ui/Form"
import MetaGrid from "@/components/ui/MetaGrid"
import Modal from "@/components/ui/Modal"
import MoreMenu from "@/components/ui/MoreMenu"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import { toast } from "@/components/ui/Toast"
import { slugify, updateManagement, useManagement } from "@/data/managementStore"
import { semesterPhase, semesterPhaseMeta, sortSemesters } from "@/lib/academic"
import { fmtDate, parseISO } from "@/lib/time"
import type { Semester } from "@/types"

type Draft = Pick<Semester, "name" | "academicYear" | "startDate" | "endDate"> & { description: string }

export default function SemesterListPage() {
  const { semesters, classes, courses, offerings } = useManagement()
  const [form, setForm] = useState<{ open: boolean; semester?: Semester }>({ open: false })
  const blank: Draft = { name: "", academicYear: "2026–2027", startDate: "", endDate: "", description: "" }
  const [values, setValues] = useState<Draft>(blank)
  const [deleting, setDeleting] = useState<Semester | null>(null)
  useEffect(() => {
    if (form.open) setValues(form.semester ? { name: form.semester.name, academicYear: form.semester.academicYear, startDate: form.semester.startDate, endDate: form.semester.endDate, description: form.semester.description ?? "" } : blank)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  const valid = values.name.trim() && values.academicYear.trim() && values.startDate && values.endDate && values.endDate > values.startDate
  const preview = valid ? semesterPhase({ ...values, id: "", archived: false }) : undefined
  const setArchived = (id: string, archived: boolean) => updateManagement((s) => ({ semesters: s.semesters.map((x) => (x.id === id ? { ...x, archived } : x)) }))
  const save = () => {
    if (!valid) return
    const data = { ...values, name: values.name.trim(), description: values.description.trim() || undefined }
    if (form.semester) {
      const id = form.semester.id
      updateManagement((s) => ({ semesters: s.semesters.map((x) => (x.id === id ? { ...x, ...data } : x)) }))
      toast("Đã cập nhật học kỳ")
    } else {
      updateManagement((s) => ({ semesters: [...s.semesters, { id: slugify(data.name), ...data, archived: false }] }))
      toast(`Đã tạo học kỳ ${data.name}`)
    }
    setForm({ open: false })
  }

  return (
    <>
      <PageHeading eyebrow="QUẢN LÝ" title="Học kỳ" description="Học kỳ chỉ lưu thông tin thời gian. Cấu hình review thuộc từng môn học trong học kỳ. Trạng thái tự cập nhật theo ngày." />
      <div className="grid grid-cols-2 gap-2">
        <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setForm({ open: true })}>Tạo học kỳ</Button>
        <Button variant="secondary" to="/rule-sets" className="flex-row-reverse" icon={<ChevronRight size={18} strokeWidth={1.75} />}>Bộ quy tắc</Button>
      </div>
      <section className="flex flex-col gap-3">
        {semesters.length === 0 ? (
          <EmptyState
            icon={<CalendarRange size={24} className="text-brand" />}
            title="Chưa có học kỳ"
            description="Tạo học kỳ đầu tiên để bắt đầu thiết lập môn học và lớp."
            action={
              <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setForm({ open: true })}>
                Tạo học kỳ
              </Button>
            }
          />
        ) : (
          sortSemesters(semesters).map((s) => {
          const phase = semesterPhaseMeta[semesterPhase(s)]
          const semClasses = classes.filter((c) => c.semesterId === s.id)
          const semCourses = offerings.filter((o) => o.semesterId === s.id).map((o) => courses.find((x) => x.id === o.courseId)?.code ?? o.courseId)
          return (
            <Card key={s.id} tinted={semesterPhase(s) === "ongoing"}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 leading-[1.4]">
                  <p className="flex items-center gap-2 text-[17px] font-semibold text-ink"><CalendarRange size={18} strokeWidth={1.75} className="text-brand" />{s.name}</p>
                  <p className="text-[12px] text-muted">Năm học {s.academicYear}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={phase.tone}>{phase.label}</Badge>
                  <MoreMenu
                    items={[
                      { label: "Chỉnh sửa", icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => setForm({ open: true, semester: s }) },
                      s.archived
                        ? { label: "Khôi phục", icon: <RotateCcw size={16} strokeWidth={1.75} />, onSelect: () => { setArchived(s.id, false); toast(`Đã khôi phục ${s.name}`) } }
                        : { label: "Lưu trữ học kỳ", icon: <Archive size={16} strokeWidth={1.75} />, onSelect: () => { setArchived(s.id, true); toast(`Đã lưu trữ ${s.name}`) } },
                      // Only empty semesters can be deleted.
                      ...(semClasses.length === 0 ? [{ label: "Xóa học kỳ", danger: true, icon: <Trash2 size={16} strokeWidth={1.75} />, onSelect: () => setDeleting(s) }] : []),
                    ]}
                  />
                </div>
              </div>
              <MetaGrid items={[{ label: "Bắt đầu", value: fmtDate(parseISO(s.startDate)) }, { label: "Kết thúc", value: fmtDate(parseISO(s.endDate)) }, { label: "Lớp", value: `${semClasses.length} lớp` }, { label: "Môn học", value: semCourses.join(", ") || "—" }]} />
            </Card>
          )
        }))}
      </section>
      <Notice>Học kỳ đã có lớp chỉ có thể lưu trữ để giữ nguyên lịch sử project và review.</Notice>

      <Modal
        open={form.open}
        onClose={() => setForm({ open: false })}
        title={form.semester ? "Chỉnh sửa học kỳ" : "Tạo học kỳ"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setForm({ open: false })}>Hủy</Button>
            <Button onClick={save} disabled={!valid} className="disabled:opacity-50">{form.semester ? "Lưu thay đổi" : "Tạo học kỳ"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Tên học kỳ" required><TextInput value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} placeholder="Fall 2026" /></Field>
          <Field label="Năm học" required><TextInput value={values.academicYear} onChange={(e) => setValues({ ...values, academicYear: e.target.value })} placeholder="2026–2027" /></Field>
          <Field label="Ngày bắt đầu" required><TextInput type="date" value={values.startDate} onChange={(e) => setValues({ ...values, startDate: e.target.value })} /></Field>
          <Field label="Ngày kết thúc" required hint={values.endDate && values.startDate && values.endDate <= values.startDate ? "Ngày kết thúc phải sau ngày bắt đầu." : undefined}>
            <TextInput type="date" value={values.endDate} onChange={(e) => setValues({ ...values, endDate: e.target.value })} />
          </Field>
        </div>
        <Field label="Mô tả"><TextArea rows={2} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} /></Field>
        <div className="flex items-center justify-between rounded-[8px] bg-subtle p-3 text-[12px]">
          <span className="text-muted">Trạng thái tự động</span>
          {preview ? <Badge tone={semesterPhaseMeta[preview].tone}>{semesterPhaseMeta[preview].label}</Badge> : <span className="text-muted">Nhập ngày để xem</span>}
        </div>
      </Modal>
      <ConfirmModal
        open={Boolean(deleting)}
        danger
        title="Xóa học kỳ"
        description={deleting ? `${deleting.name} chưa có lớp nào nên có thể xóa.` : ""}
        confirmLabel="Xóa học kỳ"
        onConfirm={() => {
          if (!deleting) return
          updateManagement((s) => ({ semesters: s.semesters.filter((x) => x.id !== deleting.id) }))
          toast(`Đã xóa ${deleting.name}`)
        }}
        onClose={() => setDeleting(null)}
      />
    </>
  )
}
