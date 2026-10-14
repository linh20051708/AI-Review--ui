import { BookOpen, Calendar, Clock, Edit3, Layers, Plus, Save, School, Users } from "lucide-react"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import LabStructureEditor from "@/components/lab/LabStructureEditor"
import ClassFormModal from "@/components/project/ClassFormModal"
import BackLink from "@/components/ui/BackLink"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import EmptyState from "@/components/ui/EmptyState"
import { Field, TextInput } from "@/components/ui/Form"
import PageHeading from "@/components/ui/PageHeading"
import SectionHeader from "@/components/ui/SectionHeader"
import { toast } from "@/components/ui/Toast"
import { updateManagement, useManagement } from "@/data/managementStore"
import type { Lab, TeachingMethod } from "@/types"

const teachingMethodsList: TeachingMethod[] = [
  "Project-based Learning",
  "Trực tiếp",
  "Trực tuyến",
  "Hybrid",
  "Flipped Classroom",
  "Blended Learning",
]

export default function CourseOfferingDetailPage() {
  const { offeringId } = useParams<{ offeringId: string }>()
  const { offerings, courses, semesters, ruleSets, classes } = useManagement()
  const [addClassOpen, setAddClassOpen] = useState(false)

  const offering = offerings.find((o) => o.id === offeringId)

  // Local state for basic offering config
  const [method, setMethod] = useState<TeachingMethod>(offering?.teachingMethod ?? "Project-based Learning")
  const [ruleSetId, setRuleSetId] = useState<string>(offering?.ruleSetId ?? "")
  const [deadline, setDeadline] = useState<string>(offering?.defaultDeadline ? offering.defaultDeadline.slice(0, 16) : "")
  const [saved, setSaved] = useState(false)

  if (!offering) {
    return (
      <EmptyState
        title="Không tìm thấy đợt môn học"
        description={`Mã đợt giảng dạy "${offeringId}" không tồn tại trong hệ thống.`}
      />
    )
  }

  const course = courses.find((c) => c.id === offering.courseId)
  const semester = semesters.find((s) => s.id === offering.semesterId)
  const classesUsing = classes.filter(
    (c) => c.offeringId === offering.id || (c.semesterId === offering.semesterId && c.courseId === offering.courseId)
  )

  const handleSaveConfig = () => {
    updateManagement((s) => ({
      offerings: s.offerings.map((o) =>
        o.id === offering.id
          ? {
              ...o,
              teachingMethod: method,
              ruleSetId,
              defaultDeadline: deadline || o.defaultDeadline,
            }
          : o
      ),
    }))
    setSaved(true)
    toast("Đã lưu cấu hình đợt môn học")
    setTimeout(() => setSaved(false), 2000)
  }

  const handleUpdateLabs = (newLabs: Lab[]) => {
    updateManagement((s) => ({
      offerings: s.offerings.map((o) =>
        o.id === offering.id
          ? {
              ...o,
              labs: newLabs,
            }
          : o
      ),
    }))
    toast("Đã cập nhật cấu trúc Lab")
  }

  const scopeLabel = `${course?.code ?? "Môn học"} · ${semester?.name ?? "Học kỳ"}`

  return (
    <>
      <BackLink label="Danh sách môn học" fallback="/courses" />
      <PageHeading
        eyebrow={`HỌC KỲ ${semester?.name?.toUpperCase() ?? "KHÔNG XÁC ĐỊNH"}`}
        title={`${course?.code ?? offering.courseId} · ${course?.name ?? "Chưa đặt tên"}`}
        description="Cấu hình cấu trúc Lab, quy tắc đánh giá và phương pháp giảng dạy cho đợt học này."
        aside={
          <Badge tone="brand">
            {classesUsing.length} lớp đang học
          </Badge>
        }
      />

      {/* Basic Offering Settings */}
      <Card>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div className="flex items-center gap-2">
            <School size={18} className="text-brand" />
            <h2 className="text-[15px] font-semibold text-ink">Thông tin & Cấu hình chung</h2>
          </div>
          <Button
            className="w-auto min-h-12 py-1.5 px-3 text-[13px]"
            icon={<Save size={14} />}
            onClick={handleSaveConfig}
          >
            {saved ? "Đã lưu" : "Lưu thay đổi"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col gap-1 rounded-[8px] bg-subtle p-3">
            <span className="text-[12px] font-medium text-muted">Học kỳ</span>
            <span className="text-[14px] font-semibold text-ink flex items-center gap-1.5">
              <Calendar size={14} className="text-muted" />
              {semester?.name} ({semester?.academicYear})
            </span>
            <span className="text-[11px] text-muted">
              {semester?.startDate} đến {semester?.endDate}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-[8px] bg-subtle p-3">
            <span className="text-[12px] font-medium text-muted">Môn học gốc (Master Data)</span>
            <span className="text-[14px] font-semibold text-ink flex items-center gap-1.5">
              <BookOpen size={14} className="text-muted" />
              {course?.code} - {course?.name}
            </span>
            <span className="text-[11px] text-muted">{course?.description || "Không có mô tả"}</span>
          </div>

          <Field label="Phương pháp giảng dạy" hint="Các lớp thuộc đợt này sẽ kế thừa phương pháp này nếu không ghi đè.">
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand min-h-12"
              value={method}
              onChange={(e) => setMethod(e.target.value as TeachingMethod)}
            >
              {teachingMethodsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Bộ quy tắc đánh giá (Rule Set)" hint="Quy định tiêu chuẩn AI và giảng viên review.">
            <select
              className="w-full rounded-[8px] border border-line bg-white p-3 text-[13px] text-ink outline-none focus:border-brand min-h-12"
              value={ruleSetId}
              onChange={(e) => setRuleSetId(e.target.value)}
            >
              {ruleSets.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Hạn chót mặc định đợt học" hint="Deadline dự phòng khi một Lab không đặt deadline riêng.">
            <TextInput
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      {/* Lab Structure Section */}
      <div className="flex flex-col gap-2 pt-2">
        <SectionHeader
          title="Cấu trúc Lab & Deliverables"
          description={`Các lớp thuộc ${scopeLabel} sẽ kế thừa toàn bộ cấu trúc Lab này.`}
        />
        <LabStructureEditor
          labs={offering.labs}
          onChange={handleUpdateLabs}
          scopeLabel={scopeLabel}
          inheritedDeadline={offering.defaultDeadline}
        />
      </div>

      {/* Classes using this offering */}
      <div className="flex flex-col gap-3 pt-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Các lớp thuộc đợt này"
            description="Danh sách các lớp học kế thừa hoặc tùy biến từ cấu hình này."
          />
          <Button
            className="w-auto min-h-12 py-1.5 px-3 text-[13px]"
            icon={<Plus size={16} />}
            onClick={() => setAddClassOpen(true)}
          >
            Thêm lớp
          </Button>
        </div>

        {classesUsing.length === 0 ? (
          <Card>
            <div className="py-6 text-center text-muted text-[13px]">
              Chưa có lớp nào được tạo cho đợt học này. Bấm &quot;Thêm lớp&quot; để tạo lớp mới.
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {classesUsing.map((cls) => {
              const hasLabOverride = Boolean(cls.labOverride && cls.labOverride.length > 0)
              const hasRuleOverride = Boolean(cls.ruleSetOverride)
              const hasMethodOverride = Boolean(cls.teachingMethodOverride)

              return (
                <Card key={cls.id}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/classes/${cls.id}`}
                        className="text-[15px] font-semibold text-brand hover:underline"
                      >
                        {cls.code}
                      </Link>
                      <div className="flex items-center gap-2 text-[12px] text-muted mt-1">
                        <Users size={14} />
                        <span>{cls.capacity} sinh viên</span>
                      </div>
                    </div>
                    <Badge tone={cls.state === "archived" ? "neutral" : "brand"}>
                      {cls.state === "archived" ? "Lưu trữ" : "Đang mở"}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-line mt-2">
                    {hasLabOverride ? (
                      <Badge tone="amber">Tùy biến Lab riêng</Badge>
                    ) : (
                      <Badge tone="neutral">Kế thừa Lab từ đợt</Badge>
                    )}
                    {hasRuleOverride && <Badge tone="amber">Tùy biến Rule</Badge>}
                    {hasMethodOverride && <Badge tone="amber">Tùy biến Phương pháp</Badge>}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link to={`/classes/${cls.id}`}>
                      <Button variant="secondary" className="w-auto min-h-12 py-1 px-3 text-[12px]">
                        Chi tiết lớp
                      </Button>
                    </Link>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ClassFormModal
        open={addClassOpen}
        onClose={() => setAddClassOpen(false)}
      />
    </>
  )
}
