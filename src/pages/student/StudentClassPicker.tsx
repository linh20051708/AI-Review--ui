import { useNavigate } from "react-router-dom"
import { selectStudentClass } from "@/app/auth"
import { useManagement } from "@/data/managementStore"
import { useStudentContext } from "./useStudentContext"
import { studentClasses } from "./studentClasses"
import { Field } from "@/components/ui/Form"

export default function StudentClassPicker({
  destination,
}: {
  destination?: string
}) {
  const state = useManagement(),
    ctx = useStudentContext(),
    navigate = useNavigate()
  const classes = studentClasses(state, ctx.student)
  if (!classes.length) return null
  return (
    <Field
      label="Lớp đang xem"
     
    >
      <select
        className="min-h-12 w-full min-w-0 max-w-full rounded-lg border border-line bg-white p-3 text-[14px] text-ink"
        value={ctx.cls?.id ?? ""}
        onChange={(e) => {
          selectStudentClass(e.target.value)
          if (destination) navigate(destination)
        }}
      >
        {classes.map(({ cls, course, semester }) => (
          <option key={cls.id} value={cls.id}>
            {course?.code ?? "Môn học"} · {cls.code} · {semester?.name ?? ""}
          </option>
        ))}
      </select>
    </Field>
  )
}
