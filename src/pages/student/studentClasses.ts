import type { State } from "@/data/managementStore"
import type { Student } from "@/types"

/** One membership per class; never infer all classes from the primary group. */
export function studentClasses(state: State, student?: Student) {
  if (!student) return []
  return state.classes
    .filter(
      (c) =>
        c.id === student.classId || student.enrolledClassIds?.includes(c.id),
    )
    .map((cls) => {
      const offering = state.offerings.find((o) => o.id === cls.offeringId)
      const course = state.courses.find(
        (c) => c.id === (offering?.courseId ?? cls.courseId),
      )
      const semester = state.semesters.find((s) => s.id === cls.semesterId)
      const group = state.groups.find(
        (g) => g.classId === cls.id && g.memberIds.includes(student.id),
      )
      const project = state.projects.find(
        (p) => p.id === group?.projectId && p.state === "active",
      )
      const registration = [...(state.registrations ?? [])]
        .reverse()
        .find((r) => r.groupId === group?.id)
      return { cls, course, semester, group, project, registration }
    })
}
