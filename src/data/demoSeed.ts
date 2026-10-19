import type { AIEvaluation, RuleSet, ReviewRequest } from "@/types"
import type { State as ManagementState } from "@/data/managementStore"
import type { State as ReviewState } from "@/data/reviewStore"
import { classes, semesters, ruleSets as legacyRules } from "@/data/mockData"
import { mockEvaluation, newCriterion, normalizeRule, personaTemplate } from "@/lib/rubric"

// Stable IDs and additive, versioned migrations: never replace a saved entity.
const prefix = "demo-ready"
const courseId = `${prefix}-course`
const offeringId = `${prefix}-offering`
const classId = `${prefix}-class`
const groupId = `${prefix}-group`
const studentId = `${prefix}-student`
const projectId = `${prefix}-project`
const semesterId = "fall-2026"
const author = "Sinh viên Demo"
const lecturer = "Nguyễn Văn An"
const time = "14/10/2026 · 09:00"
const previousTime = "13/10/2026 · 09:00"

const rubric = (kind: string, title: string, names: string[]): RuleSet => ({
  ...structuredClone(personaTemplate),
  id: `${prefix}-${kind}-rule`, name: `${title} — Demo`, documentType: title,
  scoringMode: "weighted", prerequisiteApproval: false,
  description: "Checklist minh họa cho demo, không phải rubric chính thức của giảng viên. AI mô phỏng, chưa đọc file; Supervisor xác minh bằng chứng và quyết định cuối cùng.",
  criteria: names.map((name, i) => ({
    ...newCriterion(`${kind.toUpperCase()}${String(i + 1).padStart(2, "0")}`),
    name, maxScore: 20, instruction: `Đối chiếu tài liệu với tiêu chí: ${name}`,
    evidenceRequirement: "Trích đoạn hoặc sơ đồ có vị trí tham chiếu; thiếu bằng chứng phải ghi Cần xác minh.",
  })),
})

export const demoRules: RuleSet[] = [
  { ...structuredClone(personaTemplate), id: `${prefix}-persona-rule` },
  rubric("srs", "SRS", [
    "Phạm vi, mục tiêu và các bên liên quan được xác định rõ.",
    "Yêu cầu chức năng có mã định danh và mô tả hành vi kiểm chứng được.",
    "Yêu cầu phi chức năng có chỉ số và ngưỡng đo lường.",
    "Có truy vết giữa yêu cầu, use case và tiêu chí nghiệm thu.",
    "Các ràng buộc, giả định và thuật ngữ nhất quán, không mâu thuẫn.",
  ]),
  rubric("ucd", "Use Case Diagram", [
    "Ranh giới hệ thống và phạm vi sơ đồ được xác định rõ.",
    "Actor thể hiện vai trò bên ngoài hệ thống và được đặt tên nhất quán.",
    "Use case mô tả mục tiêu có giá trị của actor.",
    "Association, include, extend và generalization dùng đúng ngữ nghĩa UML.",
    "Các use case truy vết được tới yêu cầu và kịch bản sử dụng.",
  ]),
]
const kinds = ["persona", "srs", "ucd"]
const items = demoRules.map((rule, i) => ({
  id: `${prefix}-${kinds[i]}-document`, code: `2.${i + 1}`,
  title: rule.documentType!, documentType: rule.documentType!,
  deliverableType: i === 2 ? "Diagram" as const : "Document" as const,
  ruleSetId: rule.id, required: true, aiReview: "required" as const,
  supervisorReview: "required" as const, allowedFiles: "Both" as const, dependsOn: [],
}))
const append = <T extends { id: string }>(saved: T[], defaults: T[]): T[] => [
  ...saved, ...structuredClone(defaults.filter(d => !saved.some(s => s.id === d.id))),
]

// Fill only untouched legacy defaults. A custom rule, disabled criterion, edited
// version or historical review snapshot always remains exactly as saved.
const completeLegacyRule = (rule: RuleSet): RuleSet => {
  const original = legacyRules.find(r => r.id === rule.id)
  if (!original || rule.criteria?.length) return rule
  const baseline = normalizeRule(original)
  const normalized = normalizeRule(rule)
  if (Object.keys(normalized).some(key =>
    JSON.stringify(normalized[key as keyof RuleSet]) !== JSON.stringify(baseline[key as keyof RuleSet]))) return rule
  return { ...rule, criteria: rubric("review", "Tất cả", [
    "Phạm vi tài liệu phù hợp với mục tiêu project và yêu cầu của Lab.",
    "Các thành phần bắt buộc của loại tài liệu được trình bày đầy đủ.",
    "Thuật ngữ, quy tắc và các quan hệ được sử dụng nhất quán.",
    "Nội dung truy vết được tới yêu cầu, kịch bản và bằng chứng liên quan.",
    "Các giả định, giới hạn và điểm cần xác minh được ghi rõ.",
  ]).criteria }
}

export function seedDemoManagement(s: ManagementState): ManagementState {
  if ((s.demoSeedVersion ?? 0) >= 2) return s
  return {
    ...s, demoSeedVersion: 2,
    semesters: append(s.semesters, semesters.filter(s => s.id === semesterId)),
    ruleSets: append(s.ruleSets.map(completeLegacyRule), demoRules),
    courses: append(s.courses, [{ id: courseId, code: "PRM323-DEMO", name: "Project Review AI Demo" }]),
    offerings: append(s.offerings, [{ id: offeringId, semesterId, courseId,
      teachingMethod: "Project-based Learning", ruleSetId: demoRules[0].id,
      defaultDeadline: "2026-12-15T23:59", labs: [{ id: `${prefix}-lab`, code: "Lab 2",
        title: "Persona, SRS & Use Case Diagram", items }],
    }]),
    classes: append(s.classes, [{ ...structuredClone(classes[0]), id: classId,
      code: "DEMO323", semesterId, courseId, offeringId, joinCode: "DEMO323",
      groupCount: 1, studentCount: 1, projectCount: 1, pendingReviews: 2,
    }]),
    groups: append(s.groups, [{ id: groupId, classId, projectId, name: "Demo Group",
      health: "onTrack", memberIds: [studentId], progress: 33, pendingReviews: 2, lastActivity: time,
    }]),
    students: append(s.students, [{ id: studentId, classId, groupId, name: author,
      initials: "DM", studentCode: "DEMO323", email: "demo323@example.com",
    }]),
    projects: append(s.projects, [{ id: projectId, groupId, name: "Project Review AI — Demo",
      description: "Dữ liệu mô phỏng sẵn: Persona, SRS, Use Case Diagram; không chứa file nghiên cứu thực tế.",
      lecturer, startDate: "2026-09-01", deadline: "2026-12-15T23:59", progress: 33,
      members: [{ initials: "DM", name: author, role: "Trưởng nhóm" }], state: "active", hasHistory: true,
    }]),
  }
}

export function seedDemoReviews(s: ReviewState, cfg: ManagementState): ReviewState {
  if ((s.demoSeedVersion ?? 0) >= 1) return s
  const next = { ...s, demoSeedVersion: 1, requests: [...s.requests], versions: [...s.versions],
    feedback: [...s.feedback], audit: [...s.audit], evaluations: [...s.evaluations] }
  // Seed complete review bundles only once, and only while their academic links exist.
  if (!cfg.projects.some(p => p.id === projectId)) return next
  items.forEach((item, i) => {
    const id = `${prefix}-${kinds[i]}`
    if (s.requests.some(r => r.id === id || (r.projectId === projectId && r.documentId === item.id))) return
    const rule = cfg.ruleSets.find(r => r.id === item.ruleSetId)
    if (!rule) return
    const request: ReviewRequest = {
      id, projectId, semesterId, courseId, classId, groupId, documentId: item.id,
      classCode: "DEMO323", groupName: "Demo Group", projectName: "Project Review AI — Demo",
      documentTitle: item.title, version: "v2", fileName: `${kinds[i]}-demo-v2.pdf`,
      fileType: "PDF", pageCount: 3, submitter: author, submittedAt: time, requestedAt: time,
      requestedTs: Date.parse("2026-10-14T09:00:00+07:00"), documentStatus: "resubmitted",
      aiStatus: "aiReviewed", ai: { errors: 0, warnings: 0, suggestions: 0 },
      supervisorStatus: i === 2 ? "approved" : i === 1 ? "inReview" : "waiting",
      revisionRound: 1, ruleSnapshot: structuredClone(rule),
      note: "Dữ liệu demo mô phỏng; chưa đọc file tài liệu thực tế.",
    }
    for (const version of ["v1", "v2"]) {
      const current = version === "v2"
      const versionId = `${id}-${version}`
      const evaluation = mockEvaluation({ id: `${versionId}-ai`, reviewId: id,
        documentId: item.id, documentVersionId: versionId, documentVersion: version,
        ruleSetId: rule.id, ruleSetVersion: rule.version ?? 1, ruleSnapshot: structuredClone(rule),
        evaluationStatus: "loading", criterionResults: [], overallScore: null, maxScore: 0,
        findings: [], createdAt: current ? time : previousTime,
      } satisfies AIEvaluation, item.title)
      const counts = { errors: evaluation.findings.filter(f => f.level === "error").length,
        warnings: evaluation.findings.filter(f => f.level === "warning").length,
        suggestions: evaluation.findings.filter(f => f.level === "suggestion").length }
      if (current) request.ai = counts
      const official = !current || i === 2
      const feedbackId = `${versionId}-feedback`
      next.versions.push({ id: versionId, reviewId: id, version,
        fileName: `${kinds[i]}-demo-${version}.pdf`, fileType: "PDF", pageCount: 3,
        submittedAt: current ? time : previousTime, submitter: author,
        documentStatus: current ? "resubmitted" : "submitted", ai: counts,
        supervisorStatus: current ? request.supervisorStatus : "needsRevision",
        feedbackCount: 1, isCurrent: current,
        summary: current ? "Demo: bổ sung nội dung theo feedback v1." : "Demo: cần bổ sung bằng chứng.",
      })
      next.evaluations.push(evaluation)
      next.feedback.push({ id: feedbackId, reviewId: id, version, author: lecturer,
        createdAt: current ? time : previousTime, severity: "Minor", category: "Other", official,
        message: current ? "Feedback demo: đối chiếu bằng chứng trước khi kết luận." : "Feedback demo v1: bổ sung bằng chứng và giải thích các giả định.",
      })
      next.audit.push({ id: `${versionId}-submitted`, reviewId: id, documentVersion: version,
        time: current ? time : previousTime, title: `Sinh viên gửi ${version} (demo).`, actor: author, tone: "neutral" })
      next.audit.push({ id: `${versionId}-ai-complete`, reviewId: id, documentVersion: version,
        time: current ? time : previousTime, title: "AI mô phỏng hoàn tất — chưa đọc file thực tế.", actor: "Hệ thống", tone: "olive" })
      if (official) next.audit.push({ id: `${versionId}-decision`, reviewId: id, documentVersion: version,
        time: current ? time : previousTime, title: current ? "Giảng viên phê duyệt (demo)." : "Giảng viên yêu cầu chỉnh sửa (demo).",
        actor: lecturer, tone: current ? "brand" : "rust", selectedFeedbackIds: [feedbackId] })
    }
    next.requests.push(request)
  })
  return next
}
