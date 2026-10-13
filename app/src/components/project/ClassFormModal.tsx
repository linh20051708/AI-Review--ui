import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import { ChoiceChips, Field, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import { toast } from "@/components/ui/Toast"
import { currentUser } from "@/data/mockData"
import { slugify, updateManagement, useManagement } from "@/data/managementStore"
import { semesterPhase, sortSemesters } from "@/lib/academic"
import { offeringLabel, resolveLabStructure, resolveRuleSet, resolveTeachingMethod } from "@/lib/config"
import { scheduleLabel, sessionMeta, type SchedulePattern, type Session } from "@/lib/time"
import type { ClassRoom } from "@/types"

const patterns: SchedulePattern[] = ["25", "36", "47"]
const sessions = Object.keys(sessionMeta) as Session[]

interface Form {
  code: string
  offeringId: string
  startDate: string
  endDate: string
  capacity: number
  schedule: SchedulePattern
  session: Session
}

const Inherited = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="flex flex-col gap-0.5 rounded-[8px] bg-subtle px-3 py-2 leading-[1.4]">
    <span className="text-[11px] text-muted">{label}</span>
    <span className="text-[13px] font-semibold text-ink">{value}</span>
    <span className="text-[11px] text-muted">{hint}</span>
  </div>
)

/** A class always belongs to a Course Offering; semester and course are derived from it. */
export default function ClassFormModal({ open, classRoom, onClose }: { open: boolean; classRoom?: ClassRoom; onClose: () => void }) {
  const { semesters, courses, offerings, ruleSets } = useManagement()
  const usableSemesters = sortSemesters(semesters).filter((s) => semesterPhase(s) !== "archived" && semesterPhase(s) !== "ended")
  const usable = usableSemesters.flatMap((s) => offerings.filter((o) => o.semesterId === s.id))
  // Keep the current offering selectable while editing, even if its semester has ended.
  const options = classRoom && !usable.some((o) => o.id === classRoom.offeringId) ? [...offerings.filter((o) => o.id === classRoom.offeringId), ...usable] : usable
  const lockedOffering = Boolean(classRoom && classRoom.groupCount > 0)

  const blank = (): Form => {
    const o = usable[0]
    const sem = semesters.find((s) => s.id === o?.semesterId)
    return { code: "", offeringId: o?.id ?? "", startDate: sem?.startDate ?? "", endDate: sem?.endDate ?? "", capacity: 40, schedule: "25", session: "morning" }
  }
  const [form, setForm] = useState<Form>(blank)
  useEffect(() => {
    if (!open) return
    setForm(
      classRoom
        ? { code: classRoom.code, offeringId: classRoom.offeringId, startDate: classRoom.startDate.slice(0, 10), endDate: classRoom.endDate.slice(0, 10), capacity: classRoom.capacity, schedule: classRoom.schedule, session: classRoom.session }
        : blank(),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, classRoom])

  const offering = offerings.find((o) => o.id === form.offeringId)
  const label = offeringLabel(offering, courses, semesters)
  const method = resolveTeachingMethod(undefined, classRoom, offering, label)
  const rule = resolveRuleSet(classRoom, offering, ruleSets, label)
  const labs = resolveLabStructure(classRoom, offering)
  const dateError = form.startDate && form.endDate && form.endDate <= form.startDate ? "Ngày kết thúc phải sau ngày bắt đầu." : undefined
  const canSave = Boolean(form.code.trim() && offering && form.startDate && form.endDate && !dateError && form.capacity > 0)

  const pickOffering = (id: string) => {
    const o = offerings.find((x) => x.id === id)
    const sem = semesters.find((s) => s.id === o?.semesterId)
    setForm((f) => ({ ...f, offeringId: id, ...(!classRoom && sem ? { startDate: sem.startDate, endDate: sem.endDate } : {}) }))
  }

  const save = () => {
    if (!canSave || !offering) return
    const code = form.code.trim().toUpperCase()
    const data = { code, offeringId: offering.id, semesterId: offering.semesterId, courseId: offering.courseId, startDate: form.startDate, endDate: form.endDate, capacity: form.capacity, schedule: form.schedule, session: form.session }
    if (classRoom) {
      updateManagement((s) => ({ classes: s.classes.map((c) => (c.id === classRoom.id ? { ...c, ...data } : c)) }))
      toast(`Đã cập nhật lớp ${code}`)
    } else {
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
      const sem = semesters.find((s) => s.id === offering.semesterId)
      const tag = sem ? `${sem.name[0]}${sem.name.slice(-2)}` : "XX"
      const created: ClassRoom = {
        id: slugify(code),
        ...data,
        joinCode: `${code}-${tag}-${suffix}`,
        requireApproval: true,
        qrExpiresAt: `${form.endDate}T23:59`,
        lecturer: currentUser.name,
        groupCount: 0,
        studentCount: 0,
        projectCount: 0,
        pendingReviews: 0,
        state: "active",
      }
      updateManagement((s) => ({ classes: [...s.classes, created] }))
      toast(`Đã tạo lớp ${code}`)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={classRoom ? "Chỉnh sửa lớp" : "Tạo lớp"}
      description="Mỗi lớp thuộc một môn học trong học kỳ và kế thừa cấu hình của nó."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={save} disabled={!canSave} className="disabled:opacity-50">{classRoom ? "Lưu thay đổi" : "Tạo lớp"}</Button>
        </>
      }
    >
      <Field label="Mã lớp" required><TextInput value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="SE1704" /></Field>
      <Field label="Môn học trong học kỳ" required hint={lockedOffering ? "Lớp đã có nhóm nên không thể chuyển sang môn học khác." : options.length ? undefined : "Chưa có môn học nào trong học kỳ đang mở."}>
        <select
          value={form.offeringId}
          disabled={lockedOffering || !options.length}
          onChange={(e) => pickOffering(e.target.value)}
          className="min-h-12 w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand disabled:bg-subtle disabled:text-muted"
        >
          {!options.length && <option value="">Không có lựa chọn</option>}
          {options.map((o) => (
            <option key={o.id} value={o.id}>{offeringLabel(o, courses, semesters)}</option>
          ))}
        </select>
      </Field>
      {offering && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <Inherited label="Phương pháp dạy" value={method.value ?? "—"} hint={method.source} />
          <Inherited label="Bộ quy tắc" value={rule.value?.name ?? "—"} hint={rule.source} />
          <Inherited label="Cấu trúc Lab" value={`${labs.length} Lab · ${labs.reduce((n, l) => n + l.items.length, 0)} mục`} hint={classRoom?.labOverride ? `Tùy chỉnh cho lớp ${classRoom.code}` : `Kế thừa từ ${label}`} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field label="Ngày bắt đầu" required><TextInput type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
        <Field label="Ngày kết thúc" required hint={dateError}><TextInput type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
        <Field label="Sĩ số tối đa" required><TextInput type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Lịch học"><ChoiceChips options={patterns.map(scheduleLabel)} value={scheduleLabel(form.schedule)} onChange={(v) => setForm({ ...form, schedule: patterns.find((p) => scheduleLabel(p) === v) ?? form.schedule })} /></Field>
      <Field label="Buổi"><ChoiceChips options={sessions.map((x) => sessionMeta[x].label)} value={sessionMeta[form.session].label} onChange={(v) => setForm({ ...form, session: sessions.find((x) => sessionMeta[x].label === v) ?? form.session })} /></Field>
    </Modal>
  )
}
