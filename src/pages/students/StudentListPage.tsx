import { Filter, Plus } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import AddStudentsModal from "@/components/project/AddStudentsModal"
import Avatar from "@/components/ui/Avatar"
import Button from "@/components/ui/Button"
import EmptyState from "@/components/ui/EmptyState"
import { Field, TextInput } from "@/components/ui/Form"
import PageHeading from "@/components/ui/PageHeading"
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
        title="Sinh viên"
        
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
            aria-label="Tìm sinh viên"
            placeholder="Tên, MSSV hoặc email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <p className="text-[14px] text-muted">{totalCount} sinh viên · {groupedCount} có nhóm · {unassignedCount} chưa có nhóm</p>

      {/* Filter panel */}
      <details className="rounded-xl border border-line bg-white px-4">
        <summary className="flex min-h-12 cursor-pointer items-center gap-2 text-[14px] font-semibold">
          <Filter size={16} className="text-brand" />
          <span>Bộ lọc học vụ{[selectedSemester, selectedCourse, selectedClass].some(v => v !== "all") ? " · Đang lọc" : ""}</span>
        </summary>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3">
          <Field label="Học kỳ">
            <select
              className="w-full rounded-[8px] border border-muted bg-white p-3 text-[16px] text-ink outline-none focus:border-brand min-h-12"
              value={selectedSemester}
              onChange={(e) => {
                setSelectedSemester(e.target.value)
                setSelectedCourse("all")
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
              className="w-full rounded-[8px] border border-muted bg-white p-3 text-[16px] text-ink outline-none focus:border-brand min-h-12"
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
              className="w-full rounded-[8px] border border-muted bg-white p-3 text-[16px] text-ink outline-none focus:border-brand min-h-12"
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
        <Button variant="secondary" className="mb-3" onClick={() => { setSelectedSemester("all"); setSelectedCourse("all"); setSelectedClass("all"); setSearchQuery("") }}>Xóa bộ lọc</Button>
      </details>

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
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
          {filteredStudents.map((student) => {
            const cls = classes.find((c) => c.id === student.classId)
            const crs = courses.find((c) => c.id === cls?.courseId)
            const studentGroup = groups.find((g) =>
              g.classId === student.classId && g.memberIds.includes(student.id)
            )

            return (
              <li key={student.id} className="min-w-0 px-4 py-2">
                <details>
                  <summary className="flex min-h-16 cursor-pointer items-center gap-3 py-2">
                    <Avatar initials={student.initials} size={40} />
                    <span className="min-w-0 flex-1 text-[14px] leading-relaxed">
                      <span className="block font-semibold text-ink">{student.name}</span>
                      <span className="block text-muted">{student.studentCode} · {cls?.code ?? "—"}</span>
                      <span className="block text-muted">{studentGroup?.name ?? "Chưa vào nhóm"}</span>
                    </span>
                    <span aria-hidden="true" className="text-muted">›</span>
                  </summary>
                  <div className="flex flex-col gap-2 pb-3 text-[14px]">
                    <p className="break-all text-muted">{student.email}</p>
                    {cls && <Link to={`/classes/${cls.id}`} className="flex min-h-12 items-center rounded-lg border border-line px-3 font-medium text-brand">Mở lớp {cls.code}{crs ? ` · ${crs.code}` : ""}</Link>}
                    {studentGroup && <Link to={`/groups/${studentGroup.id}`} className="flex min-h-12 items-center rounded-lg border border-line px-3 font-medium text-brand">Mở {studentGroup.name}</Link>}
                  </div>
                </details>
              </li>
            )
          })}
        </ul>
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
