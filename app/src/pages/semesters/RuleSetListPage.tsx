import { Copy, Pencil } from "lucide-react"
import { useState, type ReactNode } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { ChoiceChips, Field, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import PageHeading from "@/components/ui/PageHeading"
import { toast } from "@/components/ui/Toast"
import { updateManagement, useManagement } from "@/data/managementStore"
import { offeringLabel } from "@/lib/config"
import type { RuleSet } from "@/types"

const yes = (v: boolean) => (v ? "Bắt buộc" : "Không bắt buộc")

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-line pt-3">
      <p className="text-[10px] font-semibold tracking-wide text-brand">{title}</p>
      {children}
    </div>
  )
}
function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  )
}

export default function RuleSetListPage() {
  const { ruleSets, semesters, courses, offerings, classes } = useManagement()
  const [editing, setEditing] = useState<RuleSet | null>(null)

  const duplicate = (r: RuleSet) => {
    const copy = { ...r, id: `${r.id}-copy-${Date.now()}`, name: `${r.name} (bản sao)` }
    updateManagement((s) => ({ ruleSets: [...s.ruleSets, copy] }))
    setEditing(copy)
  }

  return (
    <>
      <PageHeading eyebrow="QUẢN LÝ" title="Bộ quy tắc" description="Cấu hình review dùng lại được: AI Review, phê duyệt, định dạng file và thời hạn." />
      <Notice>Bộ quy tắc được gán cho môn học trong học kỳ, lớp có thể dùng bộ quy tắc riêng. Tài liệu và dependency được cấu hình trong cấu trúc Lab. Chỉnh sửa bộ quy tắc sẽ áp dụng cho các yêu cầu review mới, không thay đổi lịch sử đã có.</Notice>
      {ruleSets.map((r) => {
        const usedBy = [
          ...offerings.filter((o) => o.ruleSetId === r.id).map((o) => ({ id: o.id, label: offeringLabel(o, courses, semesters), tone: "brand" as const })),
          ...classes.filter((c) => c.ruleSetOverride === r.id).map((c) => ({ id: c.id, label: `Lớp ${c.code} (tùy chỉnh)`, tone: "olive" as const })),
        ]
        return (
          <Card key={r.id}>
            <div id={r.id} className="flex scroll-mt-4 items-start justify-between gap-2">
              <div className="min-w-0 leading-[1.4]">
                <p className="text-[16px] font-semibold text-ink">{r.name}</p>
                <p className="text-[12px] text-muted">{r.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {usedBy.length ? usedBy.map((u) => <Badge key={u.id} tone={u.tone}>{u.label}</Badge>) : <Badge>Chưa áp dụng</Badge>}
            </div>
            <Group title="REVIEW">
              <Row label="AI Review" value={r.aiReview === "auto" ? "Tự động" : "Thủ công"} />
              <Row label="AI Review trước giảng viên" value={yes(r.aiRequiredBeforeSupervisor)} />
              <Row label="Supervisor approval" value={yes(r.supervisorApproval)} />
              <Row label="Prerequisite approval" value={yes(r.prerequisiteApproval)} />
            </Group>
            <Group title="FILE & THỜI HẠN">
              <Row label="Định dạng cho phép" value={r.allowedFormats.join(", ")} />
              <Row label="Dung lượng tối đa" value={`${r.maxFileSizeMB} MB`} />
              <Row label="Hạn review của giảng viên" value={`${r.reviewSlaDays} ngày`} />
              <Row label="Số lần nộp lại tối đa" value={r.maxResubmissions ?? "Không giới hạn"} />
            </Group>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" icon={<Pencil size={16} strokeWidth={1.75} />} onClick={() => setEditing(r)}>Chỉnh sửa</Button>
              <Button variant="secondary" icon={<Copy size={16} strokeWidth={1.75} />} onClick={() => duplicate(r)}>Nhân bản</Button>
            </div>
          </Card>
        )
      })}
      {editing && <RuleSetEditor key={editing.id} ruleSet={editing} onClose={() => setEditing(null)} />}
    </>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-[13px] text-ink">
      {label}
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[#146b55]" />
    </label>
  )
}

function RuleSetEditor({ ruleSet, onClose }: { ruleSet: RuleSet; onClose: () => void }) {
  const [r, setR] = useState(ruleSet)
  const set = <K extends keyof RuleSet>(k: K, v: RuleSet[K]) => setR((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      open
      onClose={onClose}
      title="Chỉnh sửa bộ quy tắc"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button
            disabled={!r.name.trim() || !r.allowedFormats.length}
            className="disabled:opacity-50"
            onClick={() => {
              updateManagement((s) => ({ ruleSets: s.ruleSets.map((x) => (x.id === r.id ? r : x)) }))
              toast("Đã lưu bộ quy tắc")
              onClose()
            }}
          >
            Lưu
          </Button>
        </>
      }
    >
      <Field label="Tên bộ quy tắc" required><TextInput value={r.name} onChange={(e) => set("name", e.target.value)} /></Field>
      <section className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold tracking-wide text-brand">REVIEW</p>
        <Field label="AI Review"><ChoiceChips options={["Tự động", "Thủ công"]} value={r.aiReview === "auto" ? "Tự động" : "Thủ công"} onChange={(v) => set("aiReview", v === "Tự động" ? "auto" : "manual")} /></Field>
        <div className="divide-y divide-line rounded-[8px] border border-line px-3">
          <Toggle label="AI Review bắt buộc trước giảng viên" value={r.aiRequiredBeforeSupervisor} onChange={(v) => set("aiRequiredBeforeSupervisor", v)} />
          <Toggle label="Supervisor approval bắt buộc" value={r.supervisorApproval} onChange={(v) => set("supervisorApproval", v)} />
          <Toggle label="Prerequisite approval bắt buộc" value={r.prerequisiteApproval} onChange={(v) => set("prerequisiteApproval", v)} />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold tracking-wide text-brand">FILE & THỜI HẠN</p>
        <div className="flex gap-2">
          {["PDF", "DOCX"].map((f) => {
            const on = r.allowedFormats.includes(f)
            return (
              <button key={f} type="button" aria-pressed={on} onClick={() => set("allowedFormats", on ? r.allowedFormats.filter((x) => x !== f) : [...r.allowedFormats, f])} className={`rounded-[8px] border px-3 py-2 text-[13px] font-medium ${on ? "border-brand bg-brand-soft text-brand" : "border-line text-ink"}`}>
                {f}
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Tối đa (MB)"><TextInput type="number" min={1} value={r.maxFileSizeMB} onChange={(e) => set("maxFileSizeMB", Number(e.target.value))} /></Field>
          <Field label="Hạn review (ngày)"><TextInput type="number" min={1} value={r.reviewSlaDays} onChange={(e) => set("reviewSlaDays", Number(e.target.value))} /></Field>
          <Field label="Nộp lại tối đa"><TextInput type="number" min={0} placeholder="∞" value={r.maxResubmissions ?? ""} onChange={(e) => set("maxResubmissions", e.target.value ? Number(e.target.value) : undefined)} /></Field>
        </div>
      </section>
    </Modal>
  )
}
