import { useSyncExternalStore } from "react"
import { auditEvents, currentUser, reviewFeedback, reviewRequests } from "@/data/mockData"
import type { AuditEvent, ReviewFeedback, ReviewRequest, SupervisorStatus } from "@/types"

/**
 * In-memory supervisor workflow state. Supervisors only change the review
 * workflow state, feedback, and audit trail; document versions stay immutable.
 */
interface State {
  requests: ReviewRequest[]
  feedback: ReviewFeedback[]
  audit: AuditEvent[]
}

let state: State = { requests: reviewRequests, feedback: reviewFeedback, audit: auditEvents }
const listeners = new Set<() => void>()
const emit = (next: State) => {
  state = next
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

const event = (reviewId: string, title: string, tone: AuditEvent["tone"], quote?: string): AuditEvent => ({
  id: uid("evt"),
  reviewId,
  time: now(),
  title,
  actor: currentUser.name,
  tone,
  quote,
})

const setStatus = (reviewId: string, supervisorStatus: SupervisorStatus) =>
  state.requests.map((r) => (r.id === reviewId ? { ...r, supervisorStatus } : r))

export function useReviewStore() {
  return useSyncExternalStore(subscribe, () => state)
}

export function useReview(reviewId?: string) {
  const s = useReviewStore()
  return s.requests.find((r) => r.id === reviewId)
}

export const reviewActions = {
  startReview(reviewId: string) {
    emit({
      ...state,
      requests: setStatus(reviewId, "inReview"),
      audit: [...state.audit, event(reviewId, `${currentUser.name} bắt đầu review.`, "brand")],
    })
  },
  addFeedback(input: Omit<ReviewFeedback, "id" | "author" | "createdAt" | "official">) {
    const fb: ReviewFeedback = { ...input, id: uid("fb"), author: currentUser.name, createdAt: now(), official: false }
    emit({
      ...state,
      feedback: [...state.feedback, fb],
      audit: [...state.audit, event(input.reviewId, "Giảng viên thêm feedback.", "amber", `“${input.message}”`)],
    })
  },
  updateFeedback(id: string, message: string) {
    emit({ ...state, feedback: state.feedback.map((f) => (f.id === id && !f.official ? { ...f, message } : f)) })
  },
  removeDraftFeedback(id: string) {
    emit({ ...state, feedback: state.feedback.filter((f) => !(f.id === id && !f.official)) })
  },
  decide(reviewId: string, decision: Extract<SupervisorStatus, "approved" | "needsRevision" | "notAccepted">, note?: string) {
    const review = state.requests.find((r) => r.id === reviewId)
    const label = review ? `${review.documentTitle} ${review.version}` : "tài liệu"
    const titles = {
      approved: `Giảng viên phê duyệt ${label}.`,
      needsRevision: `Giảng viên yêu cầu chỉnh sửa ${label}.`,
      notAccepted: `Giảng viên đánh dấu ${label} không đạt.`,
    }
    const tones = { approved: "brand", needsRevision: "rust", notAccepted: "danger" } as const
    emit({
      ...state,
      requests: setStatus(reviewId, decision),
      // Feedback becomes part of the official review history once a decision is recorded.
      feedback: state.feedback.map((f) => (f.reviewId === reviewId && f.version === review?.version ? { ...f, official: true } : f)),
      audit: [...state.audit, event(reviewId, titles[decision], tones[decision], note ? `“${note}”` : undefined)],
    })
  },
}
