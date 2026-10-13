import { semesterPhase, sortSemesters } from "@/lib/academic"
import type { FacetKey, FacetOption } from "@/lib/smartFilter"
import { useManagement } from "@/data/managementStore"

export const facetTitles: Record<FacetKey, string> = {
  semester: "Học kỳ",
  course: "Môn học",
  class: "Lớp",
  lab: "Lab",
  group: "Nhóm",
  project: "Project",
  docType: "Deliverable",
  status: "Trạng thái",
  ai: "AI Review",
}

export const aiLabels: Record<string, string> = { hasErrors: "Có lỗi", clean: "Không có lỗi", running: "AI đang review" }

export interface LabeledOption extends FacetOption {
  label: string
  sub?: string
  current?: boolean
}

/** Resolves facet ids to labels and orders options by relevance, not arbitrarily. */
export default function useFacetLabels(statusLabels: Record<string, string> = {}) {
  const { semesters, courses, classes, groups, projects } = useManagement()

  const label = (key: FacetKey, v: string): string => {
    switch (key) {
      case "semester":
        return semesters.find((s) => s.id === v)?.name ?? v
      case "course":
        return courses.find((c) => c.id === v)?.code ?? v
      case "class":
        return classes.find((c) => c.id === v)?.code ?? v
      case "group": {
        const g = groups.find((x) => x.id === v)
        return g ? `${classes.find((c) => c.id === g.classId)?.code} · ${g.name}` : v
      }
      case "project":
        return projects.find((p) => p.id === v)?.name ?? v
      case "status":
        return statusLabels[v] ?? v
      case "ai":
        return aiLabels[v] ?? v
      default:
        return v
    }
  }

  const sub = (key: FacetKey, v: string) => {
    if (key === "course") return courses.find((c) => c.id === v)?.name
    if (key === "class") {
      const c = classes.find((x) => x.id === v)
      return c && c.pendingReviews > 0 ? `${c.pendingReviews} chờ review` : undefined
    }
    if (key === "semester") return semesters.find((s) => s.id === v)?.academicYear
    return undefined
  }

  const rank = (key: FacetKey, v: string): number => {
    if (key === "semester") return sortSemesters(semesters).findIndex((s) => s.id === v)
    if (key === "class") return -(classes.find((c) => c.id === v)?.pendingReviews ?? 0)
    if (key === "status") return Object.keys(statusLabels).indexOf(v)
    if (key === "lab") return Number(v.match(/(\d+)\s*$/)?.[1] ?? 99)
    if (key === "ai") return Object.keys(aiLabels).indexOf(v)
    return 0
  }

  const decorate = (key: FacetKey, options: FacetOption[]): LabeledOption[] =>
    options
      .map((o) => ({
        ...o,
        label: label(key, o.value),
        sub: sub(key, o.value),
        current: key === "semester" && semesterPhase(semesters.find((s) => s.id === o.value)!) === "ongoing",
      }))
      // Context priority first, then more results, then alphabetical.
      .sort((a, b) => rank(key, a.value) - rank(key, b.value) || (key === "status" || key === "semester" ? 0 : b.count - a.count) || a.label.localeCompare(b.label, "vi"))

  return { label, decorate, semesters }
}
