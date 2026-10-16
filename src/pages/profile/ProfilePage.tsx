import {
  BookOpen,
  Calendar,
  ChevronRight,
  GraduationCap,
  LogOut,
  RotateCcw,
  School,
  Users2,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
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
import { currentUser } from "@/data/mockData"
import { useManagement } from "@/data/managementStore"
import { resetDemoData } from "@/data/reset"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { classes, semesters, courses, students, groups } = useManagement()
  const [confirmReset, setConfirmReset] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate("/login", { replace: true })
  }

  const academicLinks = [
    {
      title: "Học kỳ",
      count: `${semesters.length} học kỳ`,
      icon: <Calendar size={18} className="text-brand" />,
      path: "/semesters",
    },
    {
      title: "Môn học & Đợt học",
      count: `${courses.length} môn`,
      icon: <BookOpen size={18} className="text-brand" />,
      path: "/courses",
    },
    {
      title: "Lớp học",
      count: `${classes.length} lớp`,
      icon: <School size={18} className="text-brand" />,
      path: "/classes",
    },
    {
      title: "Sinh viên",
      count: `${students.length} sinh viên`,
      icon: <GraduationCap size={18} className="text-brand" />,
      path: "/students",
    },
    {
      title: "Nhóm sinh viên",
      count: `${groups.length} nhóm`,
      icon: <Users2 size={18} className="text-brand" />,
      path: "/groups",
    },
  ]

  return (
    <>
      <PageHeading eyebrow="TÀI KHOẢN" title="Tài khoản" description="Thông tin cá nhân và lối tắt truy cập phân hệ học vụ." />

      <Card>
        <div className="flex items-center gap-3">
          <Avatar initials={currentUser.initials} size={52} />
          <div className="min-w-0 flex-1 leading-[1.45]">
            <p className="text-[17px] font-semibold text-ink">{currentUser.name}</p>
            <p className="truncate text-[13px] text-muted">{currentUser.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge tone="brand">{currentUser.role}</Badge>
          <Badge>{currentUser.semester}</Badge>
        </div>
        <MetaGrid
          items={[
            { label: "Lớp phụ trách", value: `${classes.length} lớp` },
            { label: "Sinh viên", value: `${students.length} sinh viên` },
          ]}
        />
      </Card>

      {/* Secondary Academic Management access in Profile */}
      <section className="flex flex-col gap-2.5">
        <SectionHeader title="QUẢN LÝ HỌC VỤ" description="Lối tắt truy cập các danh mục dữ liệu đào tạo" />
        <Card className="gap-0 py-1">
          <ul>
            {academicLinks.map((item) => (
              <li key={item.title} className="border-b border-line last:border-b-0">
                <Link
                  to={item.path}
                  className="flex min-h-12 items-center justify-between gap-3 px-1 py-2.5 hover:text-brand transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-[6px] bg-brand-soft text-brand shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{item.title}</p>
                      <p className="text-[12px] text-muted">{item.count}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <Button
        variant="danger"
        onClick={handleSignOut}
        icon={<LogOut size={18} strokeWidth={1.75} />}
        className="min-h-12"
      >
        Đăng xuất
      </Button>

      <button
        type="button"
        onClick={() => setConfirmReset(true)}
        className="inline-flex min-h-12 items-center justify-center gap-1.5 text-[12px] font-semibold text-muted hover:text-danger"
      >
        <RotateCcw size={14} /> Reset dữ liệu demo
      </button>

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
        <p className="text-[12px] leading-[1.45] text-muted">
          Dùng trước buổi thuyết trình để demo từ trạng thái sạch. Dữ liệu học vụ cũng trở về mẫu ban đầu.
        </p>
      </ConfirmModal>
    </>
  )
}
