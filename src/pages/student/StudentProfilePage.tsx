import { BookOpen, ChevronRight, LogOut } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { selectStudentClass, signOut } from "@/app/auth"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import { studentClasses } from "./studentClasses"
import { leaderOf } from "@/data/selfService"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { useManagement } from "@/data/managementStore"
import { useStudentContext } from "./useStudentContext"

export default function StudentProfilePage() {
  const navigate = useNavigate()
  const ctx = useStudentContext()
  const state = useManagement()
  const { student } = ctx
  const classes = studentClasses(state, student)

  if (!student) return null

  const handleSignOut = () => {
    signOut()
    navigate("/login", { replace: true })
  }

  return (
    <>
      <PageHeading
        eyebrow="TÀI KHOẢN"
        title="Tài khoản"
        
      />
      <Card>
        <div className="flex min-w-0 items-start gap-3">
          <Avatar initials={student.initials} size={52} />
          <div className="min-w-0 flex-1 leading-[1.45]">
            <p className="break-words text-[17px] font-semibold text-ink">
              {student.name}
            </p>
            <p className="mt-1 break-all text-[14px] text-muted">
              {student.email}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="brand">Student</Badge>
              <Badge>{student.studentCode}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <section className="flex min-w-0 flex-col gap-3">
        <SectionHeader
          title="Thông tin học tập"
          meta={`${classes.length} lớp đã tham gia`}
        />
        <p className="text-[13px] leading-[1.45] text-muted">
          Mỗi lớp có nhóm và project riêng. Chọn lớp để xem chi tiết trong My
          Project.
        </p>
        {classes.length ? (
          <Card className="gap-0 py-1">
            <ul className="min-w-0 divide-y divide-line">
              {classes.map(({ cls, course, semester, group, project }) => (
                <li key={cls.id} className="min-w-0">
                  <Link
                    to="/student/projects"
                    onClick={() => selectStudentClass(cls.id)}
                    className="flex min-h-12 min-w-0 items-start gap-3 py-4 focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                      <BookOpen size={18} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1 leading-[1.45]">
                      <p className="break-words text-[14px] font-semibold text-ink">
                        {course?.code} · {course?.name}
                      </p>
                      <p className="mt-1 text-[13px] text-muted">
                        {cls.code} · {semester?.name}
                      </p>
                      <div className="my-2 flex flex-wrap gap-2">
                        <Badge>{group?.name ?? "Chưa có nhóm"}</Badge>
                        {group && (
                          <Badge tone="olive">
                            {leaderOf(group) === student.id
                              ? "Trưởng nhóm"
                              : "Thành viên"}
                          </Badge>
                        )}
                      </div>
                      <p className="break-words text-[13px] text-ink">
                        {project?.name ?? "Chưa có project hoạt động"}
                      </p>
                      <p className="mt-1 break-words text-[12px] text-muted">
                        Supervisor {project?.lecturer ?? cls.lecturer}
                      </p>
                    </div>
                    <ChevronRight
                      size={18}
                      className="mt-1 shrink-0 text-muted"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : (
          <EmptyState
            title="Chưa tham gia lớp"
            description="Vào My Project để tham gia lớp của từng môn học."
            action={<Button to="/student/projects">Mở My Project</Button>}
          />
        )}
      </section>

      <section className="flex min-w-0 flex-col gap-3">
        <SectionHeader title="Phiên đăng nhập" />
        <Card>
          <Button
            variant="danger"
            onClick={handleSignOut}
            icon={<LogOut size={18} strokeWidth={1.75} />}
          >
            Đăng xuất
          </Button>
        </Card>
      </section>
    </>
  )
}
