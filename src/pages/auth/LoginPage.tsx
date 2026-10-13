import { Files, LockKeyhole, Mail } from "lucide-react"
import { useState, type FormEvent } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { signIn } from "@/app/auth"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Notice from "@/components/ui/Notice"
import { currentUser } from "@/data/mockData"

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(currentUser.email)
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu.")
      return
    }
    signIn()
    const from = (location.state as { from?: string } | null)?.from
    navigate(from && from !== "/login" ? from : "/dashboard", { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-[480px] flex-col justify-center gap-8 px-5 py-10">
      <div className="flex items-center gap-2.5">
        <Files size={28} strokeWidth={1.75} className="text-brand" />
        <span className="text-[19px] font-semibold text-ink">Project Review</span>
        <Badge tone="olive">AI</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold tracking-wide text-brand">DÀNH CHO GIẢNG VIÊN</p>
        <h1 className="text-[26px] leading-[1.18] font-semibold text-ink">Đăng nhập</h1>
        <p className="text-[14px] leading-[1.45] text-muted">Theo dõi lớp, project và review tài liệu của sinh viên.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input id="email" type="email" label="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail size={18} strokeWidth={1.75} />} />
        <Input id="password" type="password" label="Mật khẩu" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} icon={<LockKeyhole size={18} strokeWidth={1.75} />} />
        {error && <p className="text-[12px] text-danger">{error}</p>}
        <Button type="submit">Đăng nhập</Button>
      </form>
      <Notice>Tài khoản demo đã được điền sẵn. AI Review chỉ hỗ trợ — quyết định phê duyệt thuộc về giảng viên.</Notice>
    </div>
  )
}
