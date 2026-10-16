import { BookOpen, LogOut, RotateCcw } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signOut } from "@/app/auth"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import ConfirmModal from "@/components/ui/ConfirmModal"
import MetaGrid from "@/components/ui/MetaGrid"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { toast } from "@/components/ui/Toast"
import { demoStudentId } from "@/data/mockData"
import { useManagement } from "@/data/managementStore"
import { resetDemoData } from "@/data/reset"
import { useStudentContext } from "./useStudentContext"

export default function StudentProfilePage() {
  const navigate = useNavigate()
  const ctx = useStudentContext()
  const { students } = useManagement()
  const [confirmReset, setConfirmReset] = useState(false)
  const { student, group, cls, semester, course, project } = ctx
  const members = group ? group.memberIds.map((id) => students.find((s) => s.id === id)).filter(Boolean) : []

  if (!student) return null

  const handleSignOut = () => {
    signOut()
    navigate("/login", { replace: true })
  }

  return (
    <>
      <PageHeading eyebrow="TÀI KHOẢN" title="Tài khoản" description="Thông tin cá nhân, nhóm và phiên demo của bạn." />
      <Card>
        <div className="flex items-center gap-3">
          <Avatar initials={student.initials} size={52} />
          <div className="min-w-0 flex-1 leading-[1.45]">
            <p className="text-[17px] font-semibold text-ink">{student.name}</p>
            <p className="truncate text-[14px] text-muted">{student.email}</p>
          </div>
          <Badge tone="brand">Student</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>{student.studentCode}</Badge>
          <Badge tone="olive">{semester?.name ?? "—"}</Badge>
          <Badge tone="olive">Lớp {cls?.code}</Badge>
          <Badge tone="olive">{group?.name ?? "—"}</Badge>
        </div>
        <MetaGrid
          items={[
            { label: "Học kỳ", value: semester?.name ?? "—" },
            { label: "Môn học", value: `${course?.code ?? "—"} · ${course?.name ?? ""}` },
            { label: "Nhóm", value: group?.name ?? "—" },
            { label: "Supervisor", value: project?.lecturer ?? "—" },
          ]}
        />
      </Card>

      {group && (
        <section className="flex flex-col gap-3">
          <SectionHeader title="Nhóm của tôi" meta={`${members.length} thành viên`} />
          <Card className="gap-0 py-1">
            <ul className="divide-y divide-line">
              {members.map((m) => (
                <li key={m!.id} className="flex items-center gap-3 py-2.5">
                  <Avatar initials={m!.initials} size={36} />
                  <div className="min-w-0 flex-1 leading-[1.45]">
                    <p className="text-[14px] font-semibold text-ink">{m!.name}</p>
                    <p className="text-[14px] text-muted">{m!.studentCode}</p>
                  </div>
                  {group.memberIds[0] === m!.id ? <Badge tone="brand">Trưởng nhóm</Badge> : <Badge>Thành viên</Badge>}
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      <div className="flex flex-col gap-2">
        <Button variant="secondary" to="/student/projects" icon={<BookOpen size={18} strokeWidth={1.75} />}>
          Xem project của tôi
        </Button>
        <Button variant="danger" onClick={handleSignOut} icon={<LogOut size={18} strokeWidth={1.75} />}>
          Đăng xuất
        </Button>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="inline-flex min-h-12 items-center justify-center gap-1.5 text-[14px] font-semibold text-muted hover:text-danger"
        >
          <RotateCcw size={14} /> Reset dữ liệu demo
        </button>
      </div>

      <ConfirmModal
        open={confirmReset}
        danger
        title="Reset dữ liệu demo"
        description="Mọi version, feedback, quyết định và thông báo sẽ trở về trạng thái ban đầu."
        confirmLabel="Reset dữ liệu"
        onConfirm={() => {
          resetDemoData()
          toast("Đã reset dữ liệu demo")
        }}
        onClose={() => setConfirmReset(false)}
      >
        <p className="text-[14px] leading-[1.45] text-muted">
          Dùng trước buổi thuyết trình để demo từ trạng thái sạch. Dữ liệu học vụ cũng trở về mẫu ban đầu.
        </p>
      </ConfirmModal>
    </>
  )
}
