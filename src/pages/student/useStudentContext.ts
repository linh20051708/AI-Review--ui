import { useMemo } from "react"

import { demoStudentId } from "@/data/mockData"

import { useManagement } from "@/data/managementStore"

import { useReviewStore } from "@/data/reviewStore"

import { documentsFor } from "@/data/selectors"

import {
  effectiveDeadline,
  offeringOf,
  resolveLabStructure,
} from "@/lib/config"

import type {
  ClassRoom,
  Course,
  CourseOffering,
  Lab,
  Project,
  ProjectDocument,
  ReviewRequest,
  Semester,
  Student,
  StudentGroup,
} from "@/types"

export interface StudentContext {
  student?: Student

  group?: StudentGroup

  cls?: ClassRoom

  semester?: Semester

  course?: Course

  offering?: CourseOffering

  project?: Project

  labs: Lab[]

  docs: (ProjectDocument & { lab: Lab })[]

  docById: (id?: string) => ProjectDocument & { lab: Lab } | undefined

  requestFor: (reviewId?: string) => ReviewRequest | undefined

  deadlineFor: (documentId: string) => { ts?: number; source: string }
}

/**
 * Derives the logged-in (demo) student's academic context straight from the
 * SHARED management + review stores — the same data the Supervisor sees.
 */

export function useStudentContext(): StudentContext {
  const mgmt = useManagement()

  const { requests } = useReviewStore()

  const { students, groups, classes, semesters, courses, offerings, projects } =
    mgmt

  const student = students.find((s) => s.id === demoStudentId)

  const group = groups.find((g) => g.id === student?.groupId)

  const cls = classes.find((c) => c.id === (group?.classId ?? student?.classId))

  const offering = offerings.find((o) => o.id === cls?.offeringId)

  const semester = semesters.find(
    (s) => s.id === (offering?.semesterId ?? cls?.semesterId),
  )

  const course = courses.find(
    (c) => c.id === (offering?.courseId ?? cls?.courseId),
  )

  const project = projects.find((p) => p.id === group?.projectId)

  const labs = useMemo(
    () => resolveLabStructure(cls, offering),
    [cls, offering],
  )

  const docs = useMemo(
    () => documentsFor(project, requests, { classes, offerings, groups }),

    [project, requests, classes, offerings, groups, mgmt.ruleSets],
  )

  const docById = (id?: string) => docs.find((d) => d.id === id)

  const requestFor = (reviewId?: string) =>
    requests.find((r) => r.id === reviewId)

  const deadlineFor = (documentId: string): { ts?: number; source: string } => {
    for (const lab of labs) {
      const item = lab.items.find((i) => i.id === documentId)

      if (item) return effectiveDeadline(item, lab, cls, offering)
    }

    return effectiveDeadline(undefined, undefined, cls, offering)
  }

  return {
    student,
    group,
    cls,
    semester,
    course,
    offering,
    project,
    labs,
    docs,
    docById,
    requestFor,
    deadlineFor,
  }
}
