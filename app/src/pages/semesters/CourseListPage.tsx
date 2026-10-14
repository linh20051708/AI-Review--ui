import { ArrowRight, BookOpen, Calendar, ChevronRight, Layers, Plus, Settings } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { Field, TextInput } from "@/components/ui/Form"
import Modal from "@/components/ui/Modal"
import PageHeading from "@/components/ui/PageHeading"
import { toast } from "@/components/ui/Toast"
import { slugify, updateManagement, useManagement } from "@/data/managementStore"
import type { CourseOffering, TeachingMethod } from "@/types"

export default function CourseListPage() {
  const { courses, classes, semesters, offerings, ruleSets } = useManagement()
  const [openAddCourse, setOpenAddCourse] = useState(false)
  const [courseForm, setCourseForm] = useState({ code: "", name: "", description: "" })

  const [openAddOffering, setOpenAddOffering] = useState<string | null>(null) // courseId
  const [offeringForm, setOfferingForm] = useState<{
    semesterId: string
    teachingMethod: TeachingMethod
    ruleSetId: string
  }>({
    semesterId: semesters[0]?.id ?? "",
    teachingMethod: "Project-based Learning",
    ruleSetId: ruleSets[0]?.id ?? "",
  })

  const handleOpenOfferingModal = (courseId: string) => {
    // Default to the first semester that doesn't have an offering for this course yet, or just the first semester
    const existingSemIds = offerings.filter((o) => o.courseId === courseId).map((o) => o.semesterId)
    const availableSem = semesters.find((s) => !existingSemIds.includes(s.id)) ?? semesters[0]
    setOfferingForm({
      semesterId: availableSem?.id ?? "",
      teachingMethod: "Project-based Learning",
      ruleSetId: ruleSets[0]?.id ?? "",
    })
    setOpenAddOffering(courseId)
  }

  const handleCreateOffering = (courseId: string) => {
    const sem = semesters.find((s) => s.id === offeringForm.semesterId)
    const crs = courses.find((c) => c.id === courseId)
    if (!sem || !crs) return

    // Find previous offering of this course to inherit labs if available
    const prevOffering = offerings.find((o) => o.courseId === courseId)
    const clonedLabs = prevOffering ? JSON.parse(JSON.stringify(prevOffering.labs)) : []

    const newOffering: CourseOffering = {
      id: `off-${slugify(sem.name)}-${crs.code.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      courseId,
      semesterId: sem.id,
      teachingMethod: offeringForm.teachingMethod,
      ruleSetId: offeringForm.ruleSetId,
      defaultDeadline: sem.endDate ? `${sem.endDate}T23:59` : "2026-12-31T23:59",
      labs: clonedLabs,
    }

    updateManagement((s) => ({
      offerings: [...s.offerings, newOffering],
    }))

    toast(`Đã tạo đợt môn học ${crs.code} cho ${sem.name}`)
    setOpenAddOffering(null)
  }

  return (
    <>
      <PageHeading
        eyebrow="QUẢN LÝ HỌC VỤ"
        title="Môn học & Đợt giảng dạy"
        description="Môn học (Master Data) và các Đợt giảng dạy (Course Offerings) theo từng học kỳ kèm cấu trúc Lab."
      />

      <div className="flex gap-2">
        <Button icon={<Plus size={18} strokeWidth={1.75} />} onClick={() => setOpenAddCourse(true)}>
          Thêm môn học mới
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {courses.map((c) => {
          const courseOfferingsList = offerings.filter((o) => o.courseId === c.id)

          return (
            <Card key={c.id}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-line pb-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-[8px] bg-brand/10 p-2 text-brand">
                    <BookOpen size={20} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[17px] font-bold text-ink">{c.code}</span>
                      <span className="text-[15px] text-muted">— {c.name}</span>
                    </div>
                    {c.description && <p className="text-[12px] text-muted mt-0.5">{c.description}</p>}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-auto min-h-12 py-1.5 px-3 text-[13px]"
                  icon={<Plus size={15} />}
                  onClick={() => handleOpenOfferingModal(c.id)}
                >
                  Mở đợt học kỳ mới
                </Button>
              </div>

              {/* Offerings list */}
              <div className="pt-2 flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                  Các đợt giảng dạy ({courseOfferingsList.length})
                </span>

                {courseOfferingsList.length === 0 ? (
                  <div className="rounded-[8px] bg-subtle p-3 text-center text-[12px] text-muted">
                    Chưa mở đợt giảng dạy nào cho môn học này. Bấm &quot;Mở đợt học kỳ mới&quot; để thiết lập.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {courseOfferingsList.map((off) => {
                      const sem = semesters.find((s) => s.id === off.semesterId)
                      const rule = ruleSets.find((r) => r.id === off.ruleSetId)
                      const offeringClasses = classes.filter(
                        (cl) => cl.offeringId === off.id || (cl.semesterId === off.semesterId && cl.courseId === off.courseId)
                      )

                      return (
                        <div
                          key={off.id}
                          className="flex flex-col justify-between gap-2 rounded-[10px] border border-line bg-subtle/50 p-3 hover:border-brand/40 transition"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[14px] font-bold text-ink flex items-center gap-1.5">
                                <Calendar size={14} className="text-brand" />
                                {sem?.name ?? off.semesterId}
                              </span>
                              <Badge tone="brand">{off.labs.length} Labs</Badge>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1 text-[11px] text-muted">
                              <span>Phương pháp: <strong className="text-ink font-medium">{off.teachingMethod}</strong></span>
                              <span>•</span>
                              <span>Rule: <strong className="text-ink font-medium">{rule?.name ?? off.ruleSetId}</strong></span>
                            </div>
                            <div className="mt-1 text-[11px] text-muted">
                              Lớp học: {offeringClasses.length > 0 ? (
                                <span className="text-ink font-medium">{offeringClasses.map((cl) => cl.code).join(", ")}</span>
                              ) : (
                                "Chưa có lớp"
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                            <span className="text-[11px] text-muted">ID: {off.id}</span>
                            <Link to={`/course-offerings/${off.id}`}>
                              <Button
                                variant="secondary"
                                className="w-auto min-h-12 py-1 px-2.5 text-[12px]"
                                icon={<Settings size={13} />}
                              >
                                Cấu hình Lab & Lớp
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Modal Add Master Course */}
      <Modal
        open={openAddCourse}
        onClose={() => setOpenAddCourse(false)}
        title="Thêm môn học mới (Master Data)"
        description="Môn học gốc được sử dụng xuyên suốt qua các học kỳ."
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenAddCourse(false)}>
              Hủy
            </Button>
            <Button
              disabled={!courseForm.code.trim() || !courseForm.name.trim()}
              className="disabled:opacity-50"
              onClick={() => {
                updateManagement((s) => ({
                  courses: [
                    ...s.courses,
                    {
                      id: slugify(courseForm.code),
                      code: courseForm.code.trim().toUpperCase(),
                      name: courseForm.name.trim(),
                      description: courseForm.description.trim() || undefined,
                    },
                  ],
                }))
                toast(`Đã thêm môn học ${courseForm.code.toUpperCase()}`)
                setCourseForm({ code: "", name: "", description: "" })
                setOpenAddCourse(false)
              }}
            >
              Thêm môn
            </Button>
          </>
        }
      >
        <Field label="Mã môn" required hint="Ví dụ: SWP391, PRN212">
          <TextInput
            value={courseForm.code}
            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
            placeholder="SWD392"
          />
        </Field>
        <Field label="Tên môn" required hint="Tên đầy đủ của môn học">
          <TextInput
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            placeholder="Software Architecture and Design"
          />
        </Field>
        <Field label="Mô tả">
          <TextInput
            value={courseForm.description}
            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            placeholder="Mô tả tóm tắt nội dung môn học..."
          />
        </Field>
      </Modal>

      {/* Modal Add Course Offering */}
      {openAddOffering && (
        <Modal
          open={Boolean(openAddOffering)}
          onClose={() => setOpenAddOffering(null)}
          title={`Mở đợt học kỳ cho ${courses.find((c) => c.id === openAddOffering)?.code}`}
          description="Thiết lập cấu hình giảng dạy riêng biệt cho học kỳ được chọn."
          footer={
            <>
              <Button variant="secondary" onClick={() => setOpenAddOffering(null)}>
                Hủy
              </Button>
              <Button onClick={() => handleCreateOffering(openAddOffering)}>
                Tạo đợt học
              </Button>
            </>
          }
        >
          <Field label="Học kỳ" required>
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand min-h-12"
              value={offeringForm.semesterId}
              onChange={(e) => setOfferingForm({ ...offeringForm, semesterId: e.target.value })}
            >
              {semesters.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.academicYear})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Phương pháp giảng dạy" required>
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand min-h-12"
              value={offeringForm.teachingMethod}
              onChange={(e) =>
                setOfferingForm({ ...offeringForm, teachingMethod: e.target.value as TeachingMethod })
              }
            >
              <option value="Project-based Learning">Project-based Learning</option>
              <option value="Trực tiếp">Trực tiếp</option>
              <option value="Trực tuyến">Trực tuyến</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Flipped Classroom">Flipped Classroom</option>
              <option value="Blended Learning">Blended Learning</option>
            </select>
          </Field>

          <Field label="Bộ quy tắc đánh giá (Rule Set)" required>
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand min-h-12"
              value={offeringForm.ruleSetId}
              onChange={(e) => setOfferingForm({ ...offeringForm, ruleSetId: e.target.value })}
            >
              {ruleSets.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>
        </Modal>
      )}
    </>
  )
}
