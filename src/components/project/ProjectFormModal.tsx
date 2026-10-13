import { AlertCircle } from "lucide-react"
import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import Button from "@/components/ui/Button"
import { Field, TextArea, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import { toast } from "@/components/ui/Toast"
import { currentUser } from "@/data/mockData"
import { slugify, updateManagement, useManagement } from "@/data/managementStore"
import { courseLabel, semesterPhase } from "@/lib/academic"
import { resolveProjectAcademicContext } from "@/lib/config"
import { teachingMethods, type Project, type TeachingMethod } from "@/types"

interface Props {
  open: boolean
  project?: Project
  defaultGroupId?: string
  onClose: () => void
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3">
    <p className="text-[10px] font-semibold tracking-wide text-brand">{title}</p>
    {children}
  </section>
)

const Inherited = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="flex flex-col gap-0.5 rounded-[8px] bg-subtle px-3 py-2 leading-[1.4]">
    <span className="text-[11px] text-muted">{label}</span>
    <span className="text-[13px] font-semibold text-ink">{value}</span>
    {hint && <span className="text-[11px] text-muted">{hint}</span>}
  </div>
)

interface Form {
  name: string
  description: string
  groupId: string
  startDate: string
  deadline: string
  reviewCutoff: string
  overrideMethod: boolean
  teachingMethod: TeachingMethod
}

/**
 * Create or update project metadata from an existing group.
 * Class, course offering, semester and course are derived — never re-selected.
 * Never touches documents or versions.
 */
export default function ProjectFormModal({ open, project, defaultGroupId, onClose }: Props) {
  const mgmt = useManagement()
  const { semesters, courses, classes, groups, projects } = mgmt

  // Groups in active classes of non-archived semesters; groups already owning another project are disabled.
  const groupOptions = useMemo(
    () =>
      classes
        .filter((c) => c.state === "active" && semesters.some((s) => s.id === c.semesterId && semesterPhase(s) !== "archived"))
        .map((c) => ({
          cls: c,
          groups: groups
            .filter((g) => g.classId === c.id)
            .map((g) => {
              const owner = projects.find((p) => p.groupId === g.id && p.id !== project?.id)
              return { id: g.id, label: owner ? `${g.name} · đã có project` : g.name, disabled: Boolean(owner) }
            }),
        }))
        .filter((x) => x.groups.length),
    [classes, semesters, groups, projects, project],
  )

  const initial = (): Form => {
    const firstFree = groupOptions.flatMap((x) => x.groups).find((g) => !g.disabled)?.id ?? ""
    const groupId = project?.groupId ?? defaultGroupId ?? firstFree
    const cls = classes.find((c) => c.id === groups.find((g) => g.id === groupId)?.classId)
    return {
      name: project?.name ?? "",
      description: project?.description ?? "",
      groupId,
      startDate: project?.startDate.slice(0, 10) ?? cls?.startDate.slice(0, 10) ?? "",
      deadline: project?.deadline.slice(0, 10) ?? cls?.endDate.slice(0, 10) ?? "",
      reviewCutoff: project?.reviewCutoff ?? "",
      overrideMethod: Boolean(project?.teachingMethodOverride),
      teachingMethod: project?.teachingMethodOverride ?? teachingMethods[0],
    }
  }
  const [f, setF] = useState<Form>(initial)
  useEffect(() => {
    if (open) setF(initial())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project, defaultGroupId])

  const group = groups.find((g) => g.id === f.groupId)
  const cls = classes.find((c) => c.id === group?.classId)
  // Resolve context as the project would be saved (override applied only when enabled).
  const draft: Project | undefined =
    group && cls
      ? {
          id: project?.id ?? "draft",
          name: f.name,
          description: f.description,
          groupId: group.id,
          lecturer: project?.lecturer ?? currentUser.name,
          teachingMethodOverride: f.overrideMethod ? f.teachingMethod : undefined,
          startDate: f.startDate,
          deadline: `${f.deadline}T23:59`,
          reviewCutoff: f.reviewCutoff || undefined,
          progress: project?.progress ?? 0,
          members: project?.members ?? [],
          state: project?.state ?? "active",
          hasHistory: project?.hasHistory ?? false,
          nextStep: project?.nextStep,
        }
      : undefined
  const ctx = draft ? resolveProjectAcademicContext(draft, mgmt) : undefined

  const conflict = projects.find((p) => p.groupId === f.groupId && p.id !== project?.id)
  const dateError = f.startDate && f.deadline && f.deadline < f.startDate ? "Deadline phải sau ngày bắt đầu." : undefined
  const canSave = Boolean(f.name.trim() && draft && ctx?.offering && f.startDate && f.deadline && !dateError && !conflict)
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }))

  const save = () => {
    if (!canSave || !draft) return
    const data = { ...draft, name: f.name.trim(), description: f.description.trim() }
    if (project) {
      updateManagement((s) => ({
        projects: s.projects.map((p) => (p.id === project.id ? { ...data, id: project.id } : p)),
        groups: s.groups.map((g) => (g.id === project.groupId && g.id !== data.groupId ? { ...g, projectId: undefined } : g.id === data.groupId ? { ...g, projectId: project.id } : g)),
      }))
      toast("Đã cập nhật thông tin project")
    } else {
      const id = slugify(data.name)
      const created: Project = { ...data, id }
      updateManagement((s) => ({ projects: [...s.projects, created], groups: s.groups.map((g) => (g.id === data.groupId ? { ...g, projectId: id } : g)) }))
      toast(`Đã tạo project ${created.name}`)
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={project ? "Chỉnh sửa project" : "Tạo project"}
      description="Project được tạo từ một nhóm có sẵn và kế thừa cấu hình của lớp. Tài liệu và version không bị ảnh hưởng."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button onClick={save} disabled={!canSave} className="disabled:opacity-50">{project ? "Lưu thay đổi" : "Tạo project"}</Button>
        </>
      }
    >
      <Section title="NHÓM">
        <Field label="Nhóm" required hint={groupOptions.length ? undefined : "Chưa có nhóm nào trong lớp đang hoạt động."}>
          <select
            value={f.groupId}
            onChange={(e) => set("groupId", e.target.value)}
            disabled={!groupOptions.length}
            className="min-h-12 w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand disabled:bg-subtle disabled:text-muted"
          >
            {!f.groupId && <option value="">Chọn nhóm</option>}
            {groupOptions.map((o) => (
              <optgroup key={o.cls.id} label={o.cls.code}>
                {o.groups.map((g) => (
                  <option key={g.id} value={g.id} disabled={g.disabled}>{g.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </Field>
        {conflict && (
          <div className="flex items-start gap-2.5 rounded-[8px] bg-rust-soft p-3 text-[12px] leading-[1.45] text-rust">
            <AlertCircle size={16} strokeWidth={1.75} className="mt-px shrink-0" />
            <p className="flex-1">
              {group?.name} đã có project <span className="font-semibold">{conflict.name}</span>. Mỗi nhóm chỉ có một project.
            </p>
            <Link to={`/projects/${conflict.id}`} onClick={onClose} className="shrink-0 font-semibold underline">Xem project</Link>
          </div>
        )}
        {ctx && (
          <div className="grid grid-cols-2 gap-2">
            <Inherited label="Học kỳ" value={ctx.semester?.name ?? "—"} />
            <Inherited label="Môn học" value={courseLabel(ctx.course)} />
            <Inherited label="Lớp" value={ctx.cls?.code ?? "—"} />
            <Inherited label="Bộ quy tắc" value={ctx.ruleSet.value?.name ?? "—"} hint={ctx.ruleSet.source} />
          </div>
        )}
        {ctx && !ctx.offering && (
          <p className="text-[12px] text-danger">Lớp này chưa gắn với môn học trong học kỳ nên chưa thể tạo project.</p>
        )}
      </Section>

      <Section title="THÔNG TIN PROJECT">
        <Field label="Tên project" required><TextInput value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Smart Campus Management" /></Field>
        <Field label="Mô tả"><TextArea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Supervisor"><TextInput value={project?.lecturer ?? currentUser.name} readOnly className="bg-subtle text-muted" /></Field>
      </Section>

      <Section title="PHƯƠNG PHÁP DẠY">
        <div className="flex flex-col gap-2 rounded-[8px] border border-line p-3">
          <div className="leading-[1.45]">
            <p className="text-[13px] font-semibold text-ink">{ctx?.teachingMethod.value ?? "—"}</p>
            <p className="text-[11px] text-muted">{ctx?.teachingMethod.source ?? "Chọn nhóm để xem cấu hình kế thừa"}</p>
          </div>
          <label className="flex items-center gap-2 text-[12px] text-ink">
            <input type="checkbox" checked={f.overrideMethod} onChange={(e) => set("overrideMethod", e.target.checked)} className="size-4 accent-[#146b55]" />
            Dùng phương pháp dạy riêng cho project
          </label>
          {f.overrideMethod && (
            <select value={f.teachingMethod} onChange={(e) => set("teachingMethod", teachingMethods.find((m) => m === e.target.value) ?? f.teachingMethod)} className="min-h-12 w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand">
              {teachingMethods.map((m) => <option key={m}>{m}</option>)}
            </select>
          )}
        </div>
      </Section>

      <Section title="THỜI GIAN">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Ngày bắt đầu" required><TextInput type="date" value={f.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
          <Field label="Deadline" required hint={dateError}><TextInput type="date" value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></Field>
        </div>
        <Field label="Hạn cuối gửi review" hint="Không bắt buộc · lưu cả ngày và giờ.">
          <TextInput type="datetime-local" value={f.reviewCutoff} onChange={(e) => set("reviewCutoff", e.target.value)} />
        </Field>
      </Section>
    </Modal>
  )
}
