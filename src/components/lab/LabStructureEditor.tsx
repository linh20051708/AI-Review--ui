import uiLabel from "@/lib/uiLabels"
import { ArrowDown, ArrowUp, Copy, GitBranch, Lock, Pencil, Plus, Save, Trash2 } from "lucide-react"
import { useState } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import ConfirmModal from "@/components/ui/ConfirmModal"
import { ChoiceChips, Field, Select, TextArea, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import MoreMenu from "@/components/ui/MoreMenu"
import { toast } from "@/components/ui/Toast"
import { updateManagement, useManagement } from "@/data/managementStore"
import { cloneLab, nextId, suggestItemCode, suggestLabCode } from "@/lib/config"
import { fmtDateTime, parseISO } from "@/lib/time"
import { deliverableTypes, type AllowedFiles, type DeliverableType, type Lab, type LabItem, type ReviewRequirement } from "@/types"

interface Props {
  compact?: boolean
  labs: Lab[]
  onChange?: (labs: Lab[]) => void
  /** Titles that already have submissions in this scope; such items/labs cannot be deleted. */
  usedTitles?: Set<string>
  /** "SWP391 · Fall 2026" — used when saving templates. */
  scopeLabel: string
  /** Fallback deadline label shown for labs without their own deadline. */
  inheritedDeadline?: string
}

const aiLabel: Record<ReviewRequirement, string> = { required: "AI bắt buộc", optional: "AI tùy chọn", disabled: "Tắt AI" }
const move = <T,>(arr: T[], i: number, d: -1 | 1) => {
  const next = [...arr]
  const j = i + d
  if (j < 0 || j >= next.length) return arr
  ;[next[i], next[j]] = [next[j], next[i]]
  return next
}

export default function LabStructureEditor({ compact = false, labs, onChange, usedTitles = new Set(), scopeLabel, inheritedDeadline }: Props) {
  const readOnly = !onChange
  const { labTemplates } = useManagement()
  const [labForm, setLabForm] = useState<{ lab?: Lab } | null>(null)
  const [itemForm, setItemForm] = useState<{ labId: string; item?: LabItem } | null>(null)
  const [deleting, setDeleting] = useState<{ labId: string; itemId?: string } | null>(null)
  const allItems = labs.flatMap((l) => l.items)
  const codeOf = (id: string) => allItems.find((i) => i.id === id)?.code ?? "?"
  const labUsed = (l: Lab) => l.items.some((i) => usedTitles.has(i.title))
  const update = (fn: (l: Lab[]) => Lab[]) => onChange?.(fn(labs))
  const patchLab = (id: string, fn: (l: Lab) => Lab) => update((ls) => ls.map((l) => (l.id === id ? fn(l) : l)))

  const removeItemRefs = (ls: Lab[], itemIds: string[]) => ls.map((l) => ({ ...l, items: l.items.map((i) => ({ ...i, dependsOn: i.dependsOn.filter((d) => !itemIds.includes(d)) })) }))

  const actions = (!readOnly && (
        <div className="flex gap-2">
          <Button className="flex-1" icon={<Plus size={16} strokeWidth={1.75} />} onClick={() => setLabForm({})}>Thêm Lab</Button>
          {labTemplates.length > 0 && (
            <MoreMenu
              label="Thêm từ mẫu"
              items={labTemplates.map((t) => ({
                label: `Từ mẫu: ${t.name}`,
                icon: <Copy size={16} strokeWidth={1.75} />,
                onSelect: () => {
                  update((ls) => [...ls, cloneLab(t.lab, suggestLabCode(ls))])
                  toast(`Đã thêm Lab từ mẫu “${t.name}”`)
                },
              }))}
            />
          )}
        </div>
      ))
  return (
    <div className="flex flex-col gap-3">
      {compact && actions}
      {labs.length === 0 && (
        <div className="flex flex-col items-center gap-1 rounded-[12px] border border-dashed border-line bg-white px-4 py-8 text-center">
          <p className="text-[14px] font-semibold text-ink">Chưa có Lab</p>
          <p className="text-[12px] text-muted">Tạo Lab và các mục deliverable sinh viên cần nộp.</p>
        </div>
      )}

      {labs.map((lab, li) => (
        <section key={lab.id} className="flex flex-col gap-3 rounded-[12px] border border-line bg-white p-4">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 leading-[1.4]">
              <p className="text-[10px] font-semibold tracking-wide text-brand">{lab.code.toUpperCase()}</p>
              <p className="text-[15px] font-semibold text-ink">{lab.title}</p>
              {lab.description && <p className="text-[12px] text-muted">{lab.description}</p>}
              <p className="mt-0.5 text-[11px] text-muted">
                Hạn nộp: {lab.deadline ? <span className="font-semibold text-ink">{fmtDateTime(parseISO(lab.deadline))}</span> : <>{inheritedDeadline ?? "—"} <span>(kế thừa)</span></>}
              </p>
            </div>
            {!readOnly && (
              <MoreMenu
                items={[
                  { label: "Chỉnh sửa", icon: <Pencil size={16} strokeWidth={1.75} />, onSelect: () => setLabForm({ lab }) },
                  { label: "Nhân bản", icon: <Copy size={16} strokeWidth={1.75} />, onSelect: () => { update((ls) => [...ls.slice(0, li + 1), cloneLab(lab, suggestLabCode(ls)), ...ls.slice(li + 1)]); toast(`Đã nhân bản ${lab.code}`) } },
                  {
                    label: "Lưu thành mẫu",
                    icon: <Save size={16} strokeWidth={1.75} />,
                    onSelect: () => {
                      updateManagement((s) => ({ labTemplates: [...s.labTemplates, { id: nextId("tpl"), name: lab.title, lab: cloneLab(lab), savedFrom: scopeLabel }] }))
                      toast(`Đã lưu “${lab.title}” vào Mẫu Lab`)
                    },
                  },
                  ...(li > 0 ? [{ label: "Di chuyển lên", icon: <ArrowUp size={16} strokeWidth={1.75} />, onSelect: () => update((ls) => move(ls, li, -1)) }] : []),
                  ...(li < labs.length - 1 ? [{ label: "Di chuyển xuống", icon: <ArrowDown size={16} strokeWidth={1.75} />, onSelect: () => update((ls) => move(ls, li, 1)) }] : []),
                  ...(!labUsed(lab) ? [{ label: "Xóa", danger: true, icon: <Trash2 size={16} strokeWidth={1.75} />, onSelect: () => setDeleting({ labId: lab.id }) }] : []),
                ]}
              />
            )}
          </div>

          <ul className={compact ? "flex flex-col divide-y divide-line" : "flex flex-col divide-y divide-line rounded-[8px] border border-line"}>
            {lab.items.map((it, ii) => {
              const used = usedTitles.has(it.title)
              return (
                <li key={it.id} className="flex items-start gap-2.5 px-3 py-2.5">
                  <span className="mt-0.5 min-w-[42px] shrink-0 rounded-[5px] bg-brand-soft px-1.5 py-0.5 text-center text-[11px] font-semibold text-brand">{it.code}</span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <p className="text-[13px] font-semibold text-ink">{it.title}</p>
                    {compact ? <details><summary className="text-muted">{it.required ? "Bắt buộc" : "Tùy chọn"} · {aiLabel[it.aiReview]}</summary><LabItemMeta item={it} compact/></details> : <LabItemMeta item={it}/>}
                    {it.dependsOn.length > 0 && (
                      <p className="inline-flex items-center gap-1 text-[11px] text-muted"><GitBranch size={12} strokeWidth={1.75} />Phụ thuộc: {it.dependsOn.map(codeOf).join(", ")}</p>
                    )}
                    {it.deadline && <p className="text-[11px] text-muted">Hạn nộp riêng: <span className="font-semibold text-ink">{fmtDateTime(parseISO(it.deadline))}</span></p>}
                    {used && <p className="inline-flex items-center gap-1 text-[11px] text-muted"><Lock size={11} strokeWidth={2} />Đã có bài nộp · không thể xóa</p>}
                  </div>
                  {!readOnly && (
                    compact ? <MoreMenu label={`Thao tác ${it.code}`} items={[
                      {label:"Chỉnh sửa", onSelect:()=>setItemForm({labId:lab.id,item:it})},
                      ...(ii>0?[{label:"Di chuyển lên",onSelect:()=>patchLab(lab.id,l=>({...l,items:move(l.items,ii,-1)}))}]:[]),
                      ...(ii<lab.items.length-1?[{label:"Di chuyển xuống",onSelect:()=>patchLab(lab.id,l=>({...l,items:move(l.items,ii,1)}))}]:[]),
                      ...(!used?[{label:"Xóa",danger:true,onSelect:()=>setDeleting({labId:lab.id,itemId:it.id})}]:[])
                    ]}/> : <div className="flex shrink-0 items-center">
                      <button type="button" aria-label="Lên" disabled={ii === 0} onClick={() => patchLab(lab.id, (l) => ({ ...l, items: move(l.items, ii, -1) }))} className="flex size-8 items-center justify-center rounded-[6px] text-muted hover:bg-subtle disabled:opacity-30"><ArrowUp size={14} strokeWidth={1.75} /></button>
                      <button type="button" aria-label="Xuống" disabled={ii === lab.items.length - 1} onClick={() => patchLab(lab.id, (l) => ({ ...l, items: move(l.items, ii, 1) }))} className="flex size-8 items-center justify-center rounded-[6px] text-muted hover:bg-subtle disabled:opacity-30"><ArrowDown size={14} strokeWidth={1.75} /></button>
                      <button type="button" aria-label="Sửa" onClick={() => setItemForm({ labId: lab.id, item: it })} className="flex size-8 items-center justify-center rounded-[6px] text-muted hover:bg-subtle"><Pencil size={14} strokeWidth={1.75} /></button>
                      <button type="button" aria-label="Xóa" disabled={used} onClick={() => setDeleting({ labId: lab.id, itemId: it.id })} className="flex size-8 items-center justify-center rounded-[6px] text-muted hover:bg-subtle hover:text-danger disabled:opacity-30"><Trash2 size={14} strokeWidth={1.75} /></button>
                    </div>
                  )}
                </li>
              )
            })}
            {!lab.items.length && <li className="px-3 py-4 text-center text-[12px] text-muted">Chưa có mục nào</li>}
          </ul>
          {!readOnly && (
            <button type="button" onClick={() => setItemForm({ labId: lab.id })} className="-my-2 inline-flex items-center gap-1.5 self-start px-1 py-2 text-[13px] font-semibold text-brand">
              <Plus size={15} strokeWidth={2} />Thêm mục vào {lab.code}
            </button>
          )}
        </section>
      ))}

      {!compact && actions}

      {labForm && (
        <LabFormModal
          lab={labForm.lab}
          suggestedCode={suggestLabCode(labs)}
          onClose={() => setLabForm(null)}
          onSave={(data) => {
            if (labForm.lab) patchLab(labForm.lab.id, (l) => ({ ...l, ...data }))
            else update((ls) => [...ls, { id: nextId("lab"), items: [], ...data }])
            toast(labForm.lab ? "Đã cập nhật Lab" : `Đã tạo ${data.code}`)
            setLabForm(null)
          }}
        />
      )}
      {itemForm && (
        <LabItemFormModal
          lab={labs.find((l) => l.id === itemForm.labId)!}
          item={itemForm.item}
          allLabs={labs}
          onClose={() => setItemForm(null)}
          onSave={(data) => {
            patchLab(itemForm.labId, (l) => ({ ...l, items: itemForm.item ? l.items.map((i) => (i.id === itemForm.item!.id ? { ...i, ...data } : i)) : [...l.items, { id: nextId("it"), ...data }] }))
            toast(itemForm.item ? "Đã cập nhật mục" : `Đã thêm ${data.code} ${data.title}`)
            setItemForm(null)
          }}
        />
      )}
      <ConfirmModal
        open={Boolean(deleting)}
        danger
        title={deleting?.itemId ? "Xóa mục Lab" : "Xóa Lab"}
        description="Chỉ có thể xóa vì chưa có bài nộp liên quan. Các phụ thuộc trỏ tới mục này sẽ được gỡ."
        confirmLabel="Xóa"
        onConfirm={() => {
          if (!deleting) return
          const lab = labs.find((l) => l.id === deleting.labId)!
          const ids = deleting.itemId ? [deleting.itemId] : lab.items.map((i) => i.id)
          update((ls) => removeItemRefs(deleting.itemId ? ls.map((l) => (l.id === lab.id ? { ...l, items: l.items.filter((i) => i.id !== deleting.itemId) } : l)) : ls.filter((l) => l.id !== lab.id), ids))
          toast("Đã xóa")
        }}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}

function LabItemMeta({item:it,compact=false}:{item:LabItem;compact?:boolean}) {
  return <div className="flex flex-wrap gap-1">
    <Badge>{uiLabel(it.deliverableType)}</Badge>
    {!compact && <><Badge tone={it.required ? "brand" : "neutral"}>{it.required ? "Bắt buộc" : "Tùy chọn"}</Badge>
    <Badge tone={it.aiReview === "disabled" ? "neutral" : "olive"}>{aiLabel[it.aiReview]}</Badge></>}
    <Badge>{it.allowedFiles === "Both" ? "PDF, DOCX" : it.allowedFiles}</Badge>
  </div>
}

type LabDraft = Pick<Lab, "code" | "title" | "description" | "deadline">

function LabFormModal({ lab, suggestedCode, onSave, onClose }: { lab?: Lab; suggestedCode: string; onSave: (d: LabDraft) => void; onClose: () => void }) {
  const [d, setD] = useState<LabDraft>({ code: lab?.code ?? suggestedCode, title: lab?.title ?? "", description: lab?.description ?? "", deadline: lab?.deadline ?? "" })
  return (
    <Modal
      open
      onClose={onClose}
      title={lab ? "Sửa Lab" : "Tạo Lab"}
      description="Tên Lab có thể tùy ý: Lab 3, Milestone 1, Proposal, Sprint Đánh giá…"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button disabled={!d.code.trim() || !d.title.trim()} className="disabled:opacity-50" onClick={() => onSave({ ...d, code: d.code.trim(), title: d.title.trim(), description: d.description?.trim() || undefined, deadline: d.deadline || undefined })}>
            {lab ? "Lưu" : "Tạo Lab"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <Field label="Mã Lab" required><TextInput value={d.code} onChange={(e) => setD({ ...d, code: e.target.value })} /></Field>
        <Field label="Tên Lab" required><TextInput value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Requirements & Analysis" /></Field>
      </div>
      <Field label="Mô tả"><TextArea rows={2} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} /></Field>
      <Field label="Hạn nộp mặc định" hint="Để trống để kế thừa hạn nộp của lớp / môn học. Mục Lab có thể ghi đè.">
        <TextInput type="datetime-local" value={d.deadline ?? ""} onChange={(e) => setD({ ...d, deadline: e.target.value })} />
      </Field>
      <p className="text-[12px] text-muted">Thứ tự hiển thị: dùng “Di chuyển lên / xuống” trong menu của Lab.</p>
    </Modal>
  )
}

type ItemDraft = Omit<LabItem, "id">
const presetTypes = ["Use Case Diagram", "Activity Diagram", "Sequence Diagram", "State Diagram", "Class Diagram", "SRS", "SDS", "Detailed Design", "Project Proposal", "Test Plan"]

function LabItemFormModal({ lab, item, allLabs, onSave, onClose }: { lab: Lab; item?: LabItem; allLabs: Lab[]; onSave: (d: ItemDraft) => void; onClose: () => void }) {
  const { offerings } = useManagement()
  const knownTypes = [...new Set([...presetTypes, ...offerings.flatMap((o) => o.labs.flatMap((l) => l.items.map((i) => i.documentType)))])]
  const [d, setD] = useState<ItemDraft>(
    item ?? { code: suggestItemCode(lab), title: "", deliverableType: "Document", documentType: "", required: true, aiReview: "required", supervisorReview: "required", allowedFiles: "Both", dependsOn: [] },
  )
  const [custom, setCustom] = useState(Boolean(item && !knownTypes.includes(item.documentType)))
  const others = allLabs.flatMap((l) => l.items.map((i) => ({ ...i, labCode: l.code }))).filter((i) => i.id !== item?.id)
  const set = <K extends keyof ItemDraft>(k: K, v: ItemDraft[K]) => setD((x) => ({ ...x, [k]: v }))

  return (
    <Modal
      open
      onClose={onClose}
      title={item ? "Sửa nội dung Lab" : "Thêm nội dung Lab"}
      description={`${lab.code} · ${lab.title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button disabled={!d.code.trim() || !d.title.trim()} className="disabled:opacity-50" onClick={() => onSave({ ...d, code: d.code.trim(), title: d.title.trim(), documentType: d.documentType || d.title.trim(), deadline: d.deadline || undefined })}>
            {item ? "Lưu" : "Thêm mục"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[110px_1fr] gap-2">
        <Field label="Mã mục" required hint="Gợi ý tự động, có thể sửa"><TextInput value={d.code} onChange={(e) => set("code", e.target.value)} /></Field>
        <Field label="Tên nội dung" required><TextInput value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="Use Case Diagram" /></Field>
      </div>
      <Field label="Loại sản phẩm" required><ChoiceChips<DeliverableType> options={deliverableTypes} value={d.deliverableType} onChange={(v) => set("deliverableType", v)} /></Field>
      <Field label="Loại tài liệu">
        <Select options={[...knownTypes, "Custom"]} value={custom ? "Custom" : d.documentType || d.title || knownTypes[0]} onChange={(e) => { const v = e.target.value; setCustom(v === "Custom"); set("documentType", v === "Custom" ? "" : v); if (!d.title && v !== "Custom") set("title", v) }} />
      </Field>
      {custom && <Field label="Loại tài liệu tùy chỉnh"><TextInput value={d.documentType} onChange={(e) => set("documentType", e.target.value)} placeholder="Deployment Diagram" /></Field>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Bắt buộc"><ChoiceChips options={["Có", "Không"]} value={d.required ? "Có" : "Không"} onChange={(v) => set("required", v === "Có")} /></Field>
        <Field label="Tệp cho phép"><ChoiceChips<AllowedFiles> options={["PDF", "DOCX", "Both"]} value={d.allowedFiles} onChange={(v) => set("allowedFiles", v)} /></Field>
        <Field label="Đánh giá AI"><ChoiceChips options={["Bắt buộc", "Tùy chọn", "Tắt"]} value={{ required: "Bắt buộc", optional: "Tùy chọn", disabled: "Tắt" }[d.aiReview]} onChange={(v) => set("aiReview", v === "Bắt buộc" ? "required" : v === "Tùy chọn" ? "optional" : "disabled")} /></Field>
        <Field label="Giảng viên đánh giá"><ChoiceChips options={["Bắt buộc", "Tùy chọn"]} value={d.supervisorReview === "required" ? "Bắt buộc" : "Tùy chọn"} onChange={(v) => set("supervisorReview", v === "Bắt buộc" ? "required" : "optional")} /></Field>
      </div>
      <Field label="Hạn nộp riêng" hint="Không bắt buộc · ghi đè hạn nộp của Lab.">
        <TextInput type="datetime-local" value={d.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} />
      </Field>
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1 text-[13px] font-semibold text-ink">Phụ thuộc <span className="font-normal text-muted">· cần được phê duyệt trước (AND)</span></legend>
        <div className="flex flex-wrap gap-1.5">
          {others.map((o) => {
            const on = d.dependsOn.includes(o.id)
            return (
              <button key={o.id} type="button" aria-pressed={on} onClick={() => set("dependsOn", on ? d.dependsOn.filter((x) => x !== o.id) : [...d.dependsOn, o.id])} className={`rounded-[6px] border px-2 py-1 text-[12px] ${on ? "border-brand bg-brand-soft font-semibold text-brand" : "border-line text-ink"}`}>
                {o.code} {o.title}
              </button>
            )
          })}
          {!others.length && <span className="text-[12px] text-muted">Chưa có mục khác.</span>}
        </div>
      </fieldset>
    </Modal>
  )
}
