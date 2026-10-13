import { NOW, parseISO } from "@/lib/time"
import type { ClassRoom, Course, Semester, Tone } from "@/types"

export type SemesterPhase = "upcoming" | "ongoing" | "ended" | "archived"

export const semesterPhaseMeta: Record<SemesterPhase, { label: string; tone: Tone }> = {
  upcoming: { label: "Sắp diễn ra", tone: "olive" },
  ongoing: { label: "Đang diễn ra", tone: "brand" },
  ended: { label: "Đã kết thúc", tone: "neutral" },
  archived: { label: "Lưu trữ", tone: "neutral" },
}

/** Status is derived from dates; archive is the only manual state. */
export const semesterPhase = (s: Semester, now = NOW): SemesterPhase => {
  if (s.archived) return "archived"
  if (now < parseISO(s.startDate)) return "upcoming"
  if (now > parseISO(s.endDate) + 86_399_999) return "ended"
  return "ongoing"
}

export const currentSemester = (list: Semester[]) => list.find((s) => semesterPhase(s) === "ongoing") ?? list[0]

/** Current first, then upcoming, then most recent past. */
export const sortSemesters = (list: Semester[]) => {
  const rank = { ongoing: 0, upcoming: 1, ended: 2, archived: 3 }
  return [...list].sort((a, b) => rank[semesterPhase(a)] - rank[semesterPhase(b)] || b.startDate.localeCompare(a.startDate))
}

export const courseLabel = (c?: Course) => (c ? `${c.code} · ${c.name}` : "—")

/** "Fall 2026 · SWP391 · SE1701" */
export const classContext = (c: ClassRoom, semesters: Semester[], courses: Course[]) =>
  [semesters.find((s) => s.id === c.semesterId)?.name, courses.find((x) => x.id === c.courseId)?.code, c.code].filter(Boolean).join(" · ")
