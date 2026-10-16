import { useSyncExternalStore } from "react"
import {
  auditEvents,
  buildReviewRequest,
  currentUser,
  documents,
  documentVersions,
  reviewFeedback,
  reviewRequests,
} from "@/data/mockData"
import { notificationActions } from "@/data/notificationStore"
import { parseVN } from "@/lib/time"
import { getManagementState } from "@/data/managementStore"
import { mockEvaluation, resolveReviewRule, validateRule } from "@/lib/rubric"
import { resolveLabStructure } from "@/lib/config"
import { seedDemoReviews } from "@/data/demoSeed"
import type {
  AIEvaluation,
  AuditEvent,
  DocumentVersion,
  FileType,
  ReviewFeedback,
  ReviewRequest,
  SupervisorStatus,
} from "@/types"

/**
 * Shared review workflow state for BOTH roles — the single source of truth.
 * Supervisors change the review workflow, feedback, and audit trail; Students
 * append immutable document versions and advance the logical review request.
 * Persisted to localStorage so role switching / refresh keeps the demo in sync.
 */
export interface State {
  demoSeedVersion?: number
  requests: ReviewRequest[]
  feedback: ReviewFeedback[]
  audit: AuditEvent[]
  versions: DocumentVersion[]
  evaluations: AIEvaluation[]
}

const KEY = "project-review:review:v1"

// Older mock documents already have submitted files but no review record.
// Materialize those records once so every submitted document has a shared history.
const seededRequests = [
  ...reviewRequests,
  ...documents
    .filter(
      (d) =>
        d.latestVersion &&
        !reviewRequests.some(
          (r) => r.projectId === d.projectId && r.documentTitle === d.title,
        ),
    )
    .map((d) =>
      buildReviewRequest({
        id: `review-seed-${d.id}`,
        projectId: d.projectId,
        documentTitle: d.title,
        version: d.latestVersion!,
        submitter: d.submitter ?? "Sinh viên",
        submittedAt: `${d.updatedAt} · 09:00`,
        requestedAt: `${d.updatedAt} · 09:00`,
        documentStatus:
          d.documentStatus === "resubmitted" ? "resubmitted" : "submitted",
        aiStatus: "aiReviewed",
        ai: d.ai ?? { errors: 0, warnings: 0, suggestions: 0 },
        supervisorStatus: d.supervisorStatus ?? "waiting",
        note: d.note,
      }),
    ),
]

const seed = (): State => seedDemoReviews({
  requests: seededRequests,
  feedback: reviewFeedback,
  audit: auditEvents,
  versions: documentVersions,
  evaluations: [],
}, getManagementState())

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as Partial<State>
      if (
        Array.isArray(s.requests) &&
        Array.isArray(s.feedback) &&
        Array.isArray(s.audit) &&
        Array.isArray(s.versions)
      ) {
        const requests = s.requests.map((r) => ({
          ...r,
          documentId:
            r.documentId ??
            seededRequests.find(
              (seed) =>
                seed.projectId === r.projectId &&
                seed.documentTitle === r.documentTitle,
            )?.documentId,
        }))
        return {
          ...s,
          evaluations: (s.evaluations ?? []).map((e) =>
            e.evaluationStatus === "loading"
              ? {
                  ...e,
                  evaluationStatus: "error",
                  error: "Lần chạy bị gián đoạn khi tải lại. Vui lòng thử lại.",
                }
              : e,
          ),
          requests: [
            ...requests,
            ...seededRequests.filter(
              (seed) =>
                !requests.some(
                  (r) =>
                    r.projectId === seed.projectId &&
                    r.documentId === seed.documentId,
                ),
            ),
          ],
        } as State
      }
    }
  } catch {
    /* fall through to seed */
  }
  return seed()
}

let state: State = seedDemoReviews(load(), getManagementState())
try {
  localStorage.setItem(KEY, JSON.stringify(state))
} catch { /* Memory-only fallback when storage is unavailable. */ }
const listeners = new Set<() => void>()
const emit = (next: State) => {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable in private mode */
  }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

const now = () => {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`
}
let seq = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`

const event = (
  reviewId: string,
  title: string,
  tone: AuditEvent["tone"],
  quote?: string,
  actor?: string,
): AuditEvent => ({
  id: uid("evt"),
  reviewId,
  time: now(),
  title,
  actor: actor ?? currentUser.name,
  tone,
  quote,
})

const setStatus = (reviewId: string, supervisorStatus: SupervisorStatus) =>
  state.requests.map((r) =>
    r.id === reviewId ? { ...r, supervisorStatus } : r,
  )

export function useReviewStore() {
  return useSyncExternalStore(subscribe, () => state)
}

export const getReviewState = () => state

export const latestEvaluation = (r: ReviewRequest) =>
  state.evaluations
    .filter((e) => e.reviewId === r.id && e.documentVersion === r.version)
    .at(-1)
export function supervisorBlock(r: ReviewRequest): string | undefined {
  const rule = resolveReviewRule(r, getManagementState())
  if (!rule || rule.status !== "active")
    return "Cần gán một bộ quy tắc Active trước khi review."
  if (
    rule.aiRequiredBeforeSupervisor &&
    latestEvaluation(r)?.evaluationStatus !== "completed"
  )
    return "Bộ quy tắc yêu cầu hoàn tất AI Evaluation trước khi giảng viên bắt đầu review hoặc ra quyết định."
}

function submissionRule(
  review: ReviewRequest,
  fileType: FileType,
  fileSize?: number,
  resubmit = false,
) {
  const cfg = getManagementState()
  const rule = resolveReviewRule({ ...review, ruleSnapshot: undefined }, cfg)
  if (!rule || rule.status !== "active")
    throw new Error("Cần gán bộ quy tắc Active trước khi nộp.")
  if (rule.aiRequiredBeforeSupervisor && validateRule(rule))
    throw new Error(
      "Bộ quy tắc yêu cầu AI nhưng checklist chưa hợp lệ. Supervisor cần cấu hình trước khi nộp.",
    )
  if (
    resubmit &&
    (!rule.resubmissionEnabled ||
      (rule.maxResubmissions !== undefined &&
        (review.revisionRound ??
          Math.max(0, Number(review.version.slice(1)) - 1)) >=
          rule.maxResubmissions))
  )
    throw new Error(
      "Bộ quy tắc không cho phép nộp lại hoặc đã hết số lần nộp lại.",
    )
  if (
    !rule.allowedFormats.includes(fileType) ||
    (fileSize !== undefined &&
      (fileSize <= 0 || fileSize > rule.maxFileSizeMB * 1024 * 1024))
  )
    throw new Error(
      "File không đúng định dạng hoặc dung lượng theo bộ quy tắc.",
    )
  const cls = cfg.classes.find((c) => c.id === review.classId)
  const item = resolveLabStructure(
    cls,
    cfg.offerings.find((o) => o.id === cls?.offeringId),
  )
    .flatMap((l) => l.items)
    .find((i) => i.id === review.documentId)
  if (item && item.allowedFiles !== "Both" && item.allowedFiles !== fileType)
    throw new Error("File không đúng định dạng của Lab Item.")
  if (
    rule.prerequisiteApproval &&
    item?.dependsOn.some(
      (id) =>
        !state.requests.some(
          (r) =>
            r.projectId === review.projectId &&
            r.documentId === id &&
            r.supervisorStatus === "approved",
        ),
    )
  )
    throw new Error("Tài liệu phụ thuộc chưa được phê duyệt.")
  return rule
}
function autoEvaluate(reviewId: string) {
  const r = state.requests.find((r) => r.id === reviewId)
  const rule = r?.ruleSnapshot
  if (rule?.aiEnabled && rule.aiReview === "auto" && !validateRule(rule))
    void runEvaluation(reviewId).catch(() => {
      /* state/error shown in workspace */
    })
}

export async function runEvaluation(reviewId: string, simulateError = false) {
  const review = state.requests.find((r) => r.id === reviewId)
  if (!review) throw new Error("Không tìm thấy yêu cầu review.")
  if (latestEvaluation(review)?.evaluationStatus === "loading") return
  if (!["waiting", "inReview"].includes(review.supervisorStatus))
    throw new Error(
      "Review đã hoàn tất; kết quả AI được giữ nguyên trong lịch sử.",
    )
  const rule = resolveReviewRule(review, getManagementState())
  if (!rule || rule.status !== "active" || !rule.aiEnabled)
    throw new Error("AI chưa được bật trong bộ quy tắc Active.")
  const invalid = validateRule(rule)
  if (invalid) throw new Error(invalid)
  const version = state.versions.find(
    (v) => v.reviewId === review.id && v.version === review.version,
  )
  const versionId = version?.id ?? `${review.id}-cur`
  const run: AIEvaluation = {
    id: uid("eval"),
    reviewId,
    documentId: review.documentId ?? review.documentTitle,
    documentVersionId: versionId,
    documentVersion: review.version,
    ruleSetId: rule.id,
    ruleSetVersion: rule.version ?? 1,
    ruleSnapshot: structuredClone(rule),
    criterionResults: [],
    overallScore: null,
    maxScore: 0,
    findings: [],
    evaluationStatus: "loading",
    createdAt: now(),
  }
  emit({
    ...state,
    requests: state.requests.map((r) =>
      r.id === reviewId
        ? { ...r, ruleSnapshot: structuredClone(rule), aiStatus: "aiReviewing" }
        : r,
    ),
    versions: version
      ? state.versions
      : [
          ...state.versions,
          {
            id: versionId,
            reviewId,
            version: review.version,
            fileName: review.fileName,
            submittedAt: review.submittedAt,
            submitter: review.submitter,
            documentStatus: review.documentStatus,
            ai: review.ai,
            supervisorStatus: review.supervisorStatus,
            feedbackCount: 0,
            isCurrent: true,
          },
        ],
    evaluations: [...state.evaluations, run],
  })
  await new Promise((resolve) => setTimeout(resolve, 1200))
  if (!state.evaluations.some((e) => e.id === run.id)) return // reset during a run
  const result: AIEvaluation = simulateError
    ? {
        ...run,
        evaluationStatus: "error",
        error: "Lỗi AI mô phỏng. Chọn Thử lại để chạy lại với cùng rubric.",
      }
    : mockEvaluation(run)
  const counts = {
    errors: result.findings.filter((f) => f.level === "error").length,
    warnings: result.findings.filter((f) => f.level === "warning").length,
    suggestions: result.criterionResults.reduce(
      (n, c) => n + c.suggestions.length,
      0,
    ),
  }
  emit({
    ...state,
    evaluations: state.evaluations.map((e) => (e.id === run.id ? result : e)),
    requests: state.requests.map((r) =>
      r.id === reviewId && r.version === run.documentVersion
        ? {
            ...r,
            aiStatus: simulateError ? "notRun" : "aiReviewed",
            ai: counts,
          }
        : r,
    ),
    audit: [
      ...state.audit,
      event(
        reviewId,
        `AI mô phỏng ${
          simulateError ? "gặp lỗi" : "hoàn tất"
        } · ${run.documentVersion} · ${rule.name} v${rule.version ?? 1}`,
        simulateError ? "rust" : "olive",
        undefined,
        "AI (mô phỏng)",
      ),
    ],
  })
  if (!simulateError)
    notificationActions.push({
      projectId: review.projectId,
      documentId: review.documentId,
      documentTitle: review.documentTitle,
      title: `AI Evaluation mô phỏng hoàn tất cho ${review.documentTitle} ${review.version}.`,
      meta: review.projectName,
    })
}

const notifySubmission = (review: ReviewRequest) => {
  const context = {
    projectId: review.projectId,
    documentId: review.documentId,
    documentTitle: review.documentTitle,
    meta: `${review.projectName} · ${review.version}`,
  }
  notificationActions.push({
    ...context,
    title: `Đã gửi yêu cầu review ${review.documentTitle} ${review.version}.`,
  })
  if (review.aiStatus === "aiReviewed")
    notificationActions.push({
      ...context,
      title: `AI Review mô phỏng hoàn tất cho ${review.documentTitle} ${review.version}.`,
    })
}

export function useReview(reviewId?: string) {
  const s = useReviewStore()
  return s.requests.find((r) => r.id === reviewId)
}

export const reviewActions = {
  completeAI(reviewId: string, version: string) {
    const review = state.requests.find(
      (r) => r.id === reviewId && r.version === version,
    )
    if (!review) return
    return runEvaluation(reviewId)
  },
  startReview(reviewId: string) {
    if (
      state.requests.find((r) => r.id === reviewId)?.supervisorStatus !==
      "waiting"
    )
      return
    const blocked = supervisorBlock(
      state.requests.find((r) => r.id === reviewId)!,
    )
    if (blocked) throw new Error(blocked)
    emit({
      ...state,
      requests: state.requests.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              supervisorStatus: "inReview",
              ruleSnapshot:
                r.ruleSnapshot ?? resolveReviewRule(r, getManagementState()),
            }
          : r,
      ),
      audit: [
        ...state.audit,
        event(reviewId, `${currentUser.name} bắt đầu review.`, "brand"),
      ],
    })
  },
  addFeedback(
    input: Omit<ReviewFeedback, "id" | "author" | "createdAt" | "official">,
  ) {
    const fb: ReviewFeedback = {
      ...input,
      id: uid("fb"),
      author: currentUser.name,
      createdAt: now(),
      official: false,
    }
    emit({
      ...state,
      feedback: [...state.feedback, fb],
      audit: [
        ...state.audit,
        event(
          input.reviewId,
          "Giảng viên thêm feedback.",
          "amber",
          `“${input.message}”`,
        ),
      ],
    })
    return fb.id
  },
  updateFeedback(id: string, message: string) {
    emit({
      ...state,
      feedback: state.feedback.map((f) =>
        f.id === id && !f.official ? { ...f, message } : f,
      ),
    })
  },
  removeDraftFeedback(id: string) {
    emit({
      ...state,
      feedback: state.feedback.filter((f) => !(f.id === id && !f.official)),
    })
  },
  decide(
    reviewId: string,
    decision: Extract<SupervisorStatus, "approved" | "needsRevision" | "notAccepted">,
    note?: string,
    includedIds?: string[],
  ) {
    const review = state.requests.find((r) => r.id === reviewId)
    if (!review || !["waiting", "inReview"].includes(review.supervisorStatus))
      return
    const blocked = supervisorBlock(review)
    if (blocked) throw new Error(blocked)
    if (decision !== "approved" && !note?.trim())
      throw new Error("Cần lý do/feedback cho quyết định này.")
    const label = review
      ? `${review.documentTitle} ${review.version}`
      : "tài liệu"
    const titles = {
      approved: `Giảng viên phê duyệt ${label}.`,
      needsRevision: `Giảng viên yêu cầu chỉnh sửa ${label}.`,
      notAccepted: `Giảng viên đánh dấu ${label} không đạt.`,
    }
    const tones = {
      approved: "brand",
      needsRevision: "rust",
      notAccepted: "danger",
    } as const
    emit({
      ...state,
      requests: state.requests.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              supervisorStatus: decision,
              ruleSnapshot:
                r.ruleSnapshot ?? resolveReviewRule(r, getManagementState()),
            }
          : r,
      ),
      // Feedback becomes part of the official review history once a decision is recorded.
      feedback: state.feedback.map((f) =>
        f.reviewId === reviewId &&
        f.version === review?.version &&
        (includedIds === undefined || includedIds.includes(f.id))
          ? { ...f, official: true }
          : f,
      ),
      audit: [
        ...state.audit,
        {
          ...event(
            reviewId,
            titles[decision],
            tones[decision],
            note ? `“${note}”` : undefined,
          ),
          documentVersion: review.version,
          selectedFeedbackIds: state.feedback
            .filter(
              (f) =>
                f.reviewId === reviewId &&
                f.version === review.version &&
                (includedIds === undefined || includedIds.includes(f.id)),
            )
            .map((f) => f.id),
        },
      ],
    })
    // Notify the student so their dashboard / notifications reflect the decision.
    if (review) {
      const messages = {
        approved: `${review.documentTitle} ${review.version} đã được phê duyệt.`,
        needsRevision: `Giảng viên yêu cầu chỉnh sửa ${review.documentTitle} ${review.version}.`,
        notAccepted: `${review.documentTitle} ${review.version} bị đánh dấu không đạt.`,
      }
      notificationActions.push({
        title: messages[decision],
        meta: `${review.projectName} · ${review.classCode} · ${review.groupName}`,
        projectId: review.projectId,
        documentId: review.documentId,
        documentTitle: review.documentTitle,
      })
    }
  },
  /**
   * Student submits a new immutable version: appends it to the version list and
   * advances the logical review request to the new version (Waiting for Review).
   */
  submitVersion(input: {
    reviewId: string
    version: string
    fileName: string
    fileType: FileType
    fileSize?: number
    pageCount: number
    note?: string
    submitter: string
  }) {
    const review = state.requests.find((r) => r.id === input.reviewId)
    if (!review || review.supervisorStatus !== "needsRevision")
      throw new Error("Chỉ được nộp lại khi giảng viên yêu cầu chỉnh sửa.")
    if (input.version !== `v${Number(review.version.slice(1)) + 1}`)
      throw new Error("Phiên bản đã thay đổi. Vui lòng mở lại trang nộp bài.")
    const ruleSnapshot = submissionRule(
      review,
      input.fileType,
      input.fileSize,
      true,
    )
    const existing = state.versions.filter((v) => v.reviewId === review.id)
    // Materialize the currently-submitted version so history keeps v1, v2, ...
    const materialized: DocumentVersion[] = existing.length
      ? existing
      : [
          {
            id: `${review.id}-cur`,
            reviewId: review.id,
            version: review.version,
            fileName: review.fileName,
            submittedAt: review.submittedAt,
            submitter: review.submitter,
            documentStatus: review.documentStatus,
            ai: review.ai,
            supervisorStatus: review.supervisorStatus,
            feedbackCount: 0,
            isCurrent: true,
          },
        ]
    const ts = now()
    const isFirst = input.version === "v1"
    const next: DocumentVersion = {
      id: uid("ver"),
      reviewId: review.id,
      version: input.version,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      pageCount: input.pageCount,
      submittedAt: ts,
      submitter: input.submitter,
      documentStatus: isFirst ? "submitted" : "resubmitted",
      ai: { errors: 0, warnings: 0, suggestions: 0 },
      supervisorStatus: "waiting",
      feedbackCount: 0,
      isCurrent: true,
    }
    emit({
      ...state,
      requests: state.requests.map((r) =>
        r.id === review.id
          ? {
              ...r,
              ruleSnapshot,
              version: input.version,
              fileName: input.fileName,
              fileType: input.fileType,
              fileSize: input.fileSize,
              pageCount: input.pageCount,
              submitter: input.submitter,
              submittedAt: ts,
              requestedAt: ts,
              requestedTs: parseVN(ts),
              documentStatus: isFirst ? "submitted" : "resubmitted",
              aiStatus: "notRun",
              ai: next.ai,
              supervisorStatus: "waiting",
              revisionRound: (r.revisionRound ?? 0) + (isFirst ? 0 : 1),
              note: input.note || undefined,
            }
          : r,
      ),
      versions: [
        ...state.versions.filter((v) => v.reviewId !== review.id),
        ...materialized.map((v) =>
          v.version === review.version
            ? {
                ...v,
                supervisorStatus: review.supervisorStatus,
                ai: review.ai,
                feedbackCount: state.feedback.filter(
                  (f) =>
                    f.reviewId === review.id &&
                    f.version === v.version &&
                    f.official,
                ).length,
                fileType: review.fileType,
                fileSize: review.fileSize,
                pageCount: review.pageCount,
                isCurrent: false,
              }
            : { ...v, isCurrent: false },
        ),
        next,
      ],
      audit: [
        ...state.audit,
        event(
          review.id,
          `${input.submitter} đã upload ${input.version}.`,
          "neutral",
          undefined,
          input.submitter,
        ),
        event(
          review.id,
          `${input.submitter} gửi yêu cầu review.`,
          "neutral",
          undefined,
          input.submitter,
        ),
      ],
    })
    notifySubmission(state.requests.find((r) => r.id === review.id)!)
    autoEvaluate(review.id)
  },
  /**
   * Student submission for a document that has no review request yet:
   * creates the logical review request (v1 or a resubmission round) plus the
   * immutable version entry.
   */
  submitFirstVersion(input: {
    review: ReviewRequest
    version: string
    fileName: string
    fileType: FileType
    fileSize?: number
    pageCount: number
  }) {
    const { review } = input
    if (!review.documentId) throw new Error("Thiếu mã tài liệu.")
    if (
      state.requests.some(
        (r) =>
          r.id === review.id ||
          (r.projectId === review.projectId &&
            r.documentId === review.documentId),
      )
    )
      throw new Error("Tài liệu đã có yêu cầu review. Vui lòng tải lại trang.")
    const ruleSnapshot = submissionRule(review, input.fileType, input.fileSize)
    const ts = now()
    const isFirst = input.version === "v1"
    const version: DocumentVersion = {
      id: uid("ver"),
      reviewId: review.id,
      version: input.version,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSize: input.fileSize,
      pageCount: input.pageCount,
      submittedAt: ts,
      submitter: review.submitter,
      documentStatus: isFirst ? "submitted" : "resubmitted",
      ai: { errors: 0, warnings: 0, suggestions: 0 },
      supervisorStatus: "waiting",
      feedbackCount: 0,
      isCurrent: true,
    }
    emit({
      ...state,
      requests: [
        ...state.requests,
        {
          ...review,
          ruleSnapshot,
          version: input.version,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          pageCount: input.pageCount,
          submittedAt: ts,
          requestedAt: ts,
          requestedTs: parseVN(ts),
          documentStatus: isFirst ? "submitted" : "resubmitted",
          aiStatus: "notRun",
          ai: version.ai,
          supervisorStatus: "waiting",
        },
      ],
      versions: [...state.versions, version],
      audit: [
        ...state.audit,
        event(
          review.id,
          `${review.submitter} đã upload ${input.version}.`,
          "neutral",
          undefined,
          review.submitter,
        ),
        event(
          review.id,
          `${review.submitter} gửi yêu cầu review.`,
          "neutral",
          undefined,
          review.submitter,
        ),
      ],
    })
    notifySubmission(state.requests.find((r) => r.id === review.id)!)
    autoEvaluate(review.id)
  },
}

export const resetReview = () => {
  state = seed()
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l())
}
