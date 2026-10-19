import { Files, GraduationCap, LockKeyhole, Mail, UserRound } from "lucide-react"
import { useState, type FormEvent, type ReactNode } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { signIn, type Role } from "@/app/auth"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Notice from "@/components/ui/Notice"
import { useManagement } from "@/data/managementStore"
import { currentUser, demoStudentId } from "@/data/mockData"

const roleOptions: { value: Role; label: string; icon: ReactNode; hint: string }[] = [
  { value: "supervisor", label: "Giảng viên", icon: <UserRound size={18} strokeWidth={1.75} />, hint: "Review tài liệu, quản lý lớp & project" },
  { value: "student", label: "Sinh viên", icon: <GraduationCap size={18} strokeWidth={1.75} />, hint: "Nộp tài liệu và theo dõi kết quả review" },
]

export default function LoginPage() {
  const { students } = useManagement()
  const [studentId, setStudentId] = useState(demoStudentId)
  const navigate = useNavigate()
  const location = useLocation()
  const [role, setRole] = useState<Role>("supervisor")
  const [email, setEmail] = useState(currentUser.email)
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")

  const pickRole = (r: Role) => {
    setRole(r)
    setEmail(r === "student" ? "minhanh@student.university.edu.vn" : currentUser.email)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.")
      return
    }
    signIn(role, role === "student" ? studentId : undefined)
    const from = (location.state as { from?: string } | null)?.from
    const home = role === "student" ? "/student/dashboard" : "/dashboard"
    const studentRoute = from === "/student" || from?.startsWith("/student/")
    const allowed = Boolean(from?.startsWith("/") && !from.startsWith("//")) && from !== "/login" && (role === "student" ? studentRoute : !studentRoute)
    navigate(allowed ? from! : home, { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col justify-center gap-8 px-5 py-10">
      <div className="flex items-center gap-2.5">
        <Files size={28} strokeWidth={1.75} className="text-brand" />
        <span className="text-[19px] font-semibold text-ink">Project Review</span>
        <Badge tone="olive">AI</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-[26px] leading-[1.18] font-semibold text-ink">Đăng nhập</h1>
        <p className="text-[14px] leading-[1.45] text-muted">Chọn vai trò để tiếp tục.</p>
      </div>

      <fieldset>
        <legend className="mb-2 text-[12px] font-semibold text-muted">Bạn đăng nhập với vai trò</legend>
        <div className="grid grid-cols-2 gap-2">
          {roleOptions.map((opt) => {
            const active = role === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => pickRole(opt.value)}
                className={`flex min-h-20 flex-col items-start justify-center gap-1 rounded-[12px] border p-3 text-left transition ${
                  active ? "border-brand bg-brand-soft" : "border-line bg-white hover:border-brand/40"
                }`}
              >
                <span className={`flex items-center gap-2 text-[14px] font-semibold ${active ? "text-brand" : "text-ink"}`}>
                  {opt.icon} {opt.label}
                </span>
                <span className="text-[14px] leading-[1.4] text-ink">{opt.hint}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      {role === "student" && <label className="flex flex-col gap-2 text-sm font-semibold">Tài khoản<select className="min-h-12 rounded-lg border border-line p-3" value={studentId} onChange={e => { setStudentId(e.target.value); setEmail(students.find(s => s.id === e.target.value)?.email ?? "") }}>{students.filter(s => [demoStudentId,"self-create","self-join","self-leader"].includes(s.id)).map(s => <option key={s.id} value={s.id}>{s.name} · {s.id === "self-create" ? "Tạo nhóm" : s.id === "self-join" ? "Tham gia nhóm" : s.id === "self-leader" ? "Trưởng nhóm có sẵn" : "Review hiện tại"}</option>)}</select></label>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          type="email"
          label={role === "student" ? "Email sinh viên" : "Email"}
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail size={18} strokeWidth={1.75} />}
        />
        <Input
          id="password"
          type="password"
          label="Mật khẩu"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockKeyhole size={18} strokeWidth={1.75} />}
        />
        {error && <p className="text-[12px] text-danger">{error}</p>}
        <Button type="submit">{role === "student" ? "Đăng nhập với vai trò Sinh viên" : "Đăng nhập"}</Button>
      </form>
    </div>
  )
}
