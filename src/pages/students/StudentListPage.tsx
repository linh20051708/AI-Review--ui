import { Filter, GraduationCap, Mail, Plus, Search, UserCheck, Users } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AddStudentsModal from "@/components/project/AddStudentsModal"
import Avatar from "@/components/ui/Avatar"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import { Field, TextInput } from "@/components/ui/Form"
import PageHeading from "@/components/ui/PageHeading"
import StatCard from "@/components/ui/StatCard"
import { useManagement } from "@/data/managementStore"

export default function StudentListPage() {
  const { students, classes, courses, semesters, groups } = useManagement()

  const [addOpen, setAddOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [selectedClass, setSelectedClass] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Available courses filtered by semester if a semester is selected
  const availableCourses = useMemo(() => {
    if (selectedSemester === "all") return courses
    const classCourseIds = classes
      .filter((c) => c.semesterId === selectedSemester)
      .map((c) => c.courseId)
    return courses.filter((crs) => classCourseIds.includes(crs.id))
  }, [courses, classes, selectedSemester])

  // Available classes filtered by semester and course
  const availableClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchSem = selectedSemester === "all" || c.semesterId === selectedSemester
      const matchCourse = selectedCourse === "all" || c.courseId === selectedCourse
      return matchSem && matchCourse
    })
  }, [classes, selectedSemester, selectedCourse])

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const cls = classes.find((c) => c.id === s.classId)
      if (!cls) return false

      if (selectedSemester !== "all" && cls.semesterId !== selectedSemester) return false
      if (selectedCourse !== "all" && cls.courseId !== selectedCourse) return false
      if (selectedClass !== "all" && cls.id !== selectedClass) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = s.name.toLowerCase().includes(q)
        const matchCode = s.studentCode.toLowerCase().includes(q)
        const matchEmail = s.email.toLowerCase().includes(q)
        return matchName || matchCode || matchEmail
      }

      return true
    })
  }, [students, classes, selectedSemester, selectedCourse, selectedClass, searchQuery])

  // Quick stats
  const totalCount = filteredStudents.length
  const groupedCount = useMemo(() => {
    const studentIdsInGroups = new Set(groups.flatMap((g) => g.memberIds))
    return filteredStudents.filter((s) => studentIdsInGroups.has(s.id)).length
  }, [filteredStudents, groups])
  const unassignedCount = totalCount - groupedCount

  return (
    <>
      <PageHeading
        eyebrow="QUẢN LÝ HỌC VỤ"
        title="Danh sách Sinh viên"
        description="Quản lý và tra cứu sinh viên theo học kỳ, môn học và lớp."
      />

      {/* Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Button
          className="w-auto min-h-[40px] px-4"
          icon={<Plus size={18} strokeWidth={1.75} />}
          onClick={() => setAddOpen(true)}
        >
          Thêm sinh viên
        </Button>

        <div className="w-full sm:w-72">
          <TextInput
            aria-label="Tìm sinh viên theo tên, MSSV, email"
            placeholder="Tìm theo tên, MSSV, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Tổng sinh viên (lọc)" value={totalCount} />
        <StatCard label="Đã có nhóm" value={groupedCount} />
        <StatCard label="Chưa có nhóm" value={unassignedCount} />
      </div>

      {/* Filter panel */}
      <Card>
        <div className="flex items-center gap-2 border-b border-line pb-2.5">
          <Filter size={16} className="text-brand" />
          <span className="text-[14px] font-semibold text-ink">Bộ lọc học vụ</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Field label="Học kỳ">
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand min-h-12"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value)
                setSelectedClass("all")
              }}
            >
              <option value="all">Tất cả học kỳ</option>
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.academicYear})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Môn học">
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand min-h-12"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value)
                setSelectedClass("all")
              }}
            >
              <option value="all">Tất cả môn học</option>
              {availableCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Lớp học">
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand focus-visible:ring-2 focus-visible:ring-brand min-h-12"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">Tất cả lớp</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.code}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {/* Student List */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          title="Không tìm thấy sinh viên"
          description={
            searchQuery || selectedClass !== "all" || selectedCourse !== "all" || selectedSemester !== "all"
              ? "Không có sinh viên nào khớp với bộ lọc hiện tại."
              : "Chưa có sinh viên nào trong hệ thống. Hãy bấm 'Thêm sinh viên' để bắt đầu."
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {filteredStudents.map((student) => {
            const cls = classes.find((c) => c.id === student.classId)
            const crs = courses.find((c) => c.id === cls?.courseId)
            const studentGroup = groups.find((g) =>
              g.classId === student.classId && g.memberIds.includes(student.id)
            )

            return (
              <Card key={student.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={student.initials} size={40} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[15px] font-semibold text-ink">{student.name}</span>
                        <Badge tone="neutral">{student.studentCode}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-muted mt-0.5">
                        <Mail size={13} />
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    {cls && (
                      <Link
                        to={`/classes/${cls.id}`}
                        className="rounded-[6px] bg-subtle px-2.5 py-1 text-[12px] font-medium text-ink hover:bg-subtle/80 hover:text-brand transition"
                      >
                        Lớp: <strong>{cls.code}</strong>
                        {crs && <span className="text-muted ml-1">({crs.code})</span>}
                      </Link>
                    )}

                    {studentGroup ? (
                      <Link
                        to={`/groups/${studentGroup.id}`}
                        className="inline-flex items-center gap-1"
                      >
                        <Badge tone="brand">
                          {studentGroup.name}
                        </Badge>
                      </Link>
                    ) : (
                      <Badge tone="amber">Chưa vào nhóm</Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultClassId={selectedClass !== "all" ? selectedClass : undefined}
      />
    </>
  )
}
