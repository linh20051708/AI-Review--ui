import { Check, Copy, FileSpreadsheet, Link2, RefreshCw, Search, Upload } from "lucide-react"
import { useRef, useState } from "react"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Notice from "@/components/ui/Notice"
import QRCode from "@/components/ui/QRCode"
import { toast } from "@/components/ui/Toast"
import { directoryStudents, emailOf, initialsOf } from "@/data/mockData"
import { updateManagement, useManagement } from "@/data/managementStore"
import { fmtDateTime, NOW, parseISO } from "@/lib/time"
import { Field, Select } from "@/components/ui/Form"
import type { ClassRoom, Student, Tone } from "@/types"

type Tab = "qr" | "import" | "manual"
type RowStatus = "valid" | "exists" | "format" | "missing"
const rowMeta: Record<RowStatus, { label: string; tone: Tone }> = {
  valid: { label: "Hợp lệ", tone: "brand" },
  exists: { label: "Đã tồn tại", tone: "neutral" },
  format: { label: "Sai định dạng", tone: "danger" },
  missing: { label: "Thiếu thông tin", tone: "amber" },
}
interface Row {
  studentCode: string
  name: string
  email: string
  status: RowStatus
}

const tabs: { id: Tab; label: string }[] = [
  { id: "qr", label: "Mã QR" },
  { id: "import", label: "Import danh sách" },
  { id: "manual", label: "Nhập thủ công" },
]

/** The single entry point for adding students to a class. */
export default function AddStudentsModal({
  open,
  classRoom,
  onClose,
  defaultClassId,
}: {
  open: boolean
  classRoom?: ClassRoom
  onClose: () => void
  defaultClassId?: string
}) {
  const [tab, setTab] = useState<Tab>("qr")
  const { students, classes } = useManagement()
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classRoom?.id ?? defaultClassId ?? classes[0]?.id ?? ""
  )

  const activeClass = classRoom ?? classes.find((c) => c.id === selectedClassId) ?? classes[0]
  const inClass = activeClass ? students.filter((s) => s.classId === activeClass.id) : []

  const addStudents = (list: Omit<Student, "id" | "classId" | "initials">[]) => {
    if (!activeClass) return
    const created = list.map((s, i) => ({
      ...s,
      id: `new-${Date.now()}-${i}`,
      classId: activeClass.id,
      initials: initialsOf(s.name),
    }))
    updateManagement((st) => ({
      students: [...st.students, ...created],
      classes: st.classes.map((c) =>
        c.id === activeClass.id ? { ...c, studentCount: c.studentCount + created.length } : c
      ),
    }))
    toast(`Đã thêm ${created.length} sinh viên vào ${activeClass.code}`)
    onClose()
  }

  if (!activeClass) {
    return (
      <Modal open={open} onClose={onClose} title="Thêm sinh viên" description="Chưa có lớp học nào trong hệ thống.">
        <p className="text-[13px] text-muted py-4">Vui lòng tạo lớp học trước khi thêm sinh viên.</p>
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm sinh viên" description="Chọn cách thêm sinh viên vào lớp.">
      {!classRoom && (
        <div className="mb-3">
          <Field label="Chọn lớp học nhận sinh viên" required>
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand min-h-12"
              value={activeClass.id}
              onChange={(e) => setSelectedClassId(e.target.value)}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </Field>
        </div>
      )}
      <div id="add-students-tablist" role="tablist" className="grid grid-cols-3 gap-1 rounded-[8px] bg-subtle p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            id={`add-students-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`add-students-tabpanel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const i = tabs.findIndex((x) => x.id === tab)
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault()
                const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length]
                setTab(next.id)
                document.getElementById(`add-students-tab-${next.id}`)?.focus()
              } else if (e.key === "Home") {
                e.preventDefault()
                setTab(tabs[0].id)
                document.getElementById(`add-students-tab-${tabs[0].id}`)?.focus()
              } else if (e.key === "End") {
                e.preventDefault()
                setTab(tabs[tabs.length - 1].id)
                document.getElementById(`add-students-tab-${tabs[tabs.length - 1].id}`)?.focus()
              }
            }}
            className={`rounded-[6px] px-1 py-2 text-[12px] font-medium transition sm:text-[13px] ${tab === t.id ? "bg-white text-brand shadow-[0_1px_2px_rgba(36,51,45,0.08)]" : "text-muted"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div id={`add-students-tabpanel-${tab}`} role="tabpanel" aria-labelledby={`add-students-tab-${tab}`}>
        {tab === "qr" && <QRTab classRoom={activeClass} />}
        {tab === "import" && <ImportTab inClass={inClass} onAdd={addStudents} />}
        {tab === "manual" && <ManualTab inClass={inClass} onAdd={addStudents} />}
      </div>
    </Modal>
  )
}

function QRTab({ classRoom }: { classRoom: ClassRoom }) {
  const link = `https://review.university.edu.vn/join/${classRoom.joinCode}`
  const expired = parseISO(classRoom.qrExpiresAt) < NOW
  const update = (patch: Partial<ClassRoom>) => updateManagement((s) => ({ classes: s.classes.map((c) => (c.id === classRoom.id ? { ...c, ...patch } : c)) }))
  const copy = (text: string, msg: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    toast(msg)
  }
  const regenerate = () => {
    const suffix = Array.from({ length: 4 }, () => "ABCDEFGHJKMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 31)]).join("")
    update({ joinCode: classRoom.joinCode.replace(/[^-]+$/, suffix), qrExpiresAt: "2026-11-30T23:59" })
    toast("Đã tạo lại mã QR. Mã cũ không còn hiệu lực.")
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[14px] font-semibold text-ink">Sinh viên tự tham gia lớp</h3>
      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-line bg-brand-tint p-4">
        <div className={expired ? "opacity-30" : ""}>
          <QRCode value={classRoom.joinCode} size={184} />
        </div>
        <div className="text-center leading-[1.45]">
          <p className="text-[12px] text-muted">Mã lớp</p>
          <p className="text-[18px] font-semibold tracking-wide text-ink">{classRoom.joinCode}</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2">
          <Button icon={<Copy size={16} strokeWidth={1.75} />} onClick={() => copy(classRoom.joinCode, "Đã sao chép mã lớp")} className="whitespace-nowrap px-2 text-[13px]">Sao chép mã</Button>
          <Button variant="secondary" icon={<Link2 size={16} strokeWidth={1.75} />} onClick={() => copy(link, "Đã sao chép liên kết tham gia")} className="whitespace-nowrap px-2 text-[13px]">Sao chép liên kết</Button>
        </div>
      </div>
      <p className="text-[12px] leading-[1.45] text-muted">Sinh viên quét mã QR hoặc nhập mã lớp để gửi yêu cầu tham gia.</p>
      <div className="flex items-center justify-between gap-3 rounded-[8px] border border-line p-3 text-[12px]">
        <div className="leading-[1.45]">
          <p className="text-muted">QR hết hạn</p>
          <p className={`font-semibold ${expired ? "text-danger" : "text-ink"}`}>{fmtDateTime(parseISO(classRoom.qrExpiresAt))}{expired && " · Đã hết hạn"}</p>
        </div>
        <button type="button" onClick={regenerate} className="inline-flex items-center gap-1.5 font-semibold text-brand">
          <RefreshCw size={14} strokeWidth={1.75} />Tạo lại mã QR
        </button>
      </div>
      <label className="flex items-start gap-3 rounded-[8px] border border-line p-3">
        <input type="checkbox" checked={classRoom.requireApproval} onChange={(e) => update({ requireApproval: e.target.checked })} className="mt-0.5 size-4 accent-[#146b55]" />
        <span className="leading-[1.45]">
          <span className="block text-[13px] font-semibold text-ink">Yêu cầu giảng viên duyệt sinh viên mới</span>
          <span className="block text-[12px] text-muted">
            {classRoom.requireApproval ? "Yêu cầu tham gia sẽ chờ bạn chấp nhận hoặc từ chối trong tab Sinh viên." : "Sinh viên đủ điều kiện sẽ tham gia ngay sau khi gửi yêu cầu."}
          </span>
        </span>
      </label>
      <ol className="flex flex-col gap-1 rounded-[8px] bg-subtle p-3 text-[12px] leading-[1.5] text-muted">
        <li>1. Sinh viên quét QR và đăng nhập</li>
        <li>2. Xem đúng lớp {classRoom.code}, gửi yêu cầu tham gia</li>
        <li>3. Hệ thống kiểm tra điều kiện{classRoom.requireApproval ? " → chờ giảng viên duyệt" : ""}</li>
        <li>4. Tham gia lớp</li>
      </ol>
    </div>
  )
}

const CODE = /^[A-Z]{2}\d{6}$/
const sampleRows = (inClass: Student[]): Omit<Row, "status">[] => [
  ...directoryStudents.slice(0, 12).map((d) => ({ studentCode: d.studentCode, name: d.name, email: d.email })),
  ...Array.from({ length: 19 }, (_, i) => {
    const code = `SE1703${String(10 + i).padStart(2, "0")}`
    const name = `${["Phạm", "Lê", "Nguyễn", "Trần", "Võ", "Đặng"][i % 6]} ${["Minh", "Thu", "Gia", "Hải"][i % 4]} ${["Trí", "Uyên", "Vĩnh", "Xuân", "Yến", "An", "Bảo", "Chi", "Duy", "Giang", "Hiếu", "Khoa", "Lâm", "Ngân", "Oanh", "Phúc", "Quang", "Sơn", "Tâm"][i]}`
    return { studentCode: code, name, email: emailOf(name, code) }
  }),
  ...inClass.slice(0, 2).map((s) => ({ studentCode: s.studentCode, name: s.name, email: s.email })),
  { studentCode: "SE17-ABC", name: "Đoàn Văn Ý", email: "yd@university.edu.vn" },
]

function ImportTab({ inClass, onAdd }: { inClass: Student[]; onAdd: (l: Omit<Student, "id" | "classId" | "initials">[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState("")
  const [rows, setRows] = useState<Row[]>([])

  const validate = (raw: Omit<Row, "status">[]): Row[] => {
    const seen = new Set(inClass.map((s) => s.studentCode))
    return raw.map((r) => {
      let status: RowStatus = "valid"
      if (!r.studentCode || !r.name || !r.email) status = "missing"
      else if (!CODE.test(r.studentCode) || !r.email.includes("@")) status = "format"
      else if (seen.has(r.studentCode)) status = "exists"
      seen.add(r.studentCode)
      return { ...r, status }
    })
  }
  const load = async (file?: File) => {
    if (!file) {
      setFileName("danh-sach-SE1701.xlsx")
      setRows(validate(sampleRows(inClass)))
      return
    }
    setFileName(file.name)
    if (file.name.toLowerCase().endsWith(".csv")) {
      const lines = (await file.text()).split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
      const body = /mã|code/i.test(lines[0] ?? "") ? lines.slice(1) : lines
      setRows(validate(body.slice(0, 500).map((l) => {
        const [studentCode = "", name = "", email = ""] = l.split(/[,;\t]/).map((x) => x.trim())
        return { studentCode: studentCode.toUpperCase(), name, email }
      })))
    } else setRows(validate(sampleRows(inClass)))
  }
  const valid = rows.filter((r) => r.status === "valid")
  const exists = rows.filter((r) => r.status === "exists").length
  const errors = rows.length - valid.length - exists

  if (!rows.length)
    return (
      <div className="flex flex-col gap-3">
        <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => load(e.target.files?.[0])} />
        <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-[12px] border border-dashed border-line bg-subtle px-4 py-8 text-[13px] text-muted hover:border-brand/40">
          <Upload size={22} strokeWidth={1.75} className="text-brand" />
          <span className="font-semibold text-ink">Chọn file danh sách</span>
          CSV hoặc XLSX · tối đa 500 dòng
        </button>
        <div className="rounded-[8px] border border-line p-3 text-[12px] leading-[1.5]">
          <p className="font-semibold text-ink">Cột bắt buộc</p>
          <p className="text-muted">Mã sinh viên · Họ và tên · Email</p>
        </div>
        <button type="button" onClick={() => load()} className="self-start text-[12px] font-semibold text-brand">Dùng file mẫu để xem trước</button>
      </div>
    )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-[13px]">
        <FileSpreadsheet size={18} strokeWidth={1.75} className="text-brand" />
        <span className="min-w-0 flex-1 truncate font-medium text-ink">{fileName}</span>
        <button type="button" onClick={() => setRows([])} className="text-[12px] font-semibold text-muted">Chọn file khác</button>
      </div>
      <p className="text-[14px] font-semibold text-ink">Đã đọc {rows.length} sinh viên</p>
      <div className="flex flex-wrap gap-2">
        <Badge tone="brand">{valid.length} hợp lệ</Badge>
        <Badge>{exists} đã tồn tại</Badge>
        <Badge tone="danger">{errors} lỗi</Badge>
      </div>
      <div className="max-h-[300px] overflow-auto rounded-[8px] border border-line">
        <table className="w-full text-left text-[12px]">
          <thead className="sticky top-0 bg-subtle text-[11px] text-muted">
            <tr>{["Mã sinh viên", "Họ và tên", "Email", "Trạng thái"].map((h) => <th key={h} className="px-2.5 py-2 font-semibold whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-2.5 py-2 whitespace-nowrap text-ink">{r.studentCode || "—"}</td>
                <td className="px-2.5 py-2 whitespace-nowrap text-ink">{r.name || "—"}</td>
                <td className="max-w-[160px] truncate px-2.5 py-2 text-muted">{r.email || "—"}</td>
                <td className="px-2.5 py-2"><Badge tone={rowMeta[r.status].tone}>{rowMeta[r.status].label}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Notice>Sinh viên đã có trong lớp sẽ không bị thêm trùng. Dòng lỗi được bỏ qua.</Notice>
      <Button disabled={!valid.length} className="disabled:opacity-50" onClick={() => onAdd(valid.map(({ studentCode, name, email }) => ({ studentCode, name, email })))}>
        Thêm {valid.length} sinh viên hợp lệ
      </Button>
    </div>
  )
}

function ManualTab({ inClass, onAdd }: { inClass: Student[]; onAdd: (l: Omit<Student, "id" | "classId" | "initials">[]) => void }) {
  const [q, setQ] = useState("")
  const [picked, setPicked] = useState<string[]>([])
  const existing = new Set(inClass.map((s) => s.studentCode))
  const pool = directoryStudents.filter((d) => !existing.has(d.studentCode))
  const term = q.trim().toLowerCase()
  const results = (term ? pool.filter((d) => `${d.studentCode} ${d.name} ${d.email}`.toLowerCase().includes(term)) : pool).slice(0, 8)
  const toggle = (code: string) => setPicked((p) => (p.includes(code) ? p.filter((x) => x !== code) : [...p, code]))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-11 items-center gap-2 rounded-[8px] border border-line bg-white px-3 focus-within:border-brand">
        <Search size={17} strokeWidth={1.75} className="text-muted" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm sinh viên..." className="min-w-0 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-muted" />
      </label>
      <p className="text-[11px] text-muted">Tìm theo mã sinh viên, email hoặc họ tên.</p>
      <ul className="flex flex-col divide-y divide-line rounded-[8px] border border-line">
        {results.map((d) => {
          const on = picked.includes(d.studentCode)
          return (
            <li key={d.studentCode} className={`flex items-center gap-3 px-3 py-2.5 ${on ? "bg-brand-tint" : ""}`}>
              <Avatar initials={d.initials} size={32} />
              <div className="min-w-0 flex-1 leading-[1.4]">
                <p className="text-[12px] text-muted">{d.studentCode}</p>
                <p className="text-[13px] font-semibold text-ink">{d.name}</p>
                <p className="truncate text-[11px] text-muted">{d.email}</p>
              </div>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(d.studentCode)}
                className={`inline-flex h-8 shrink-0 items-center gap-1 rounded-[6px] border px-3 text-[12px] font-semibold ${on ? "border-brand bg-brand text-white" : "border-line bg-white text-ink"}`}
              >
                {on && <Check size={13} strokeWidth={2.5} />}
                {on ? "Đã chọn" : "Thêm"}
              </button>
            </li>
          )
        })}
        {!results.length && <li className="px-3 py-6 text-center text-[12px] text-muted">Không tìm thấy sinh viên chưa có trong lớp.</li>}
      </ul>
      <Button disabled={!picked.length} className="disabled:opacity-50" onClick={() => onAdd(directoryStudents.filter((d) => picked.includes(d.studentCode)).map(({ studentCode, name, email }) => ({ studentCode, name, email })))}>
        {picked.length ? `Thêm ${picked.length} sinh viên` : "Chọn sinh viên để thêm"}
      </Button>
    </div>
  )
}
