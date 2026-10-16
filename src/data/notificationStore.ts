import { useSyncExternalStore } from "react"
import type { Notification } from "@/types"

/**
 * Student notification feed. Shared store so decisions made by the Supervisor
 * (or deadlines/AI events) push notifications that link to the exact document.
 * Persisted to localStorage; reset together with the other demo stores.
 */
export interface StudentNotification extends Notification {
  projectId?: string
  documentTitle?: string
  documentId?: string
}

interface State {
  notifications: StudentNotification[]
}

const KEY = "project-review:notifications:v1"

const seed = (): State => ({
  notifications: [
    { id: "sn1", title: "Giảng viên yêu cầu chỉnh sửa State Diagram v1", meta: "Smart Campus Management · 2 ngày trước", unread: true, projectId: "smart-campus-management", documentTitle: "State Diagram" },
    { id: "sn2", title: "AI Review hoàn tất cho Sequence Diagram v2", meta: "Smart Campus Management · 3 giờ trước", unread: true, projectId: "smart-campus-management", documentTitle: "Sequence Diagram" },
    { id: "sn3", title: "Use Case Diagram v3 đã được phê duyệt", meta: "Smart Campus Management · 1 tháng trước", unread: false, projectId: "smart-campus-management", documentTitle: "Use Case Diagram" },
    { id: "sn4", title: "Deadline nộp Activity Diagram sắp đến", meta: "Smart Campus Management · 5 ngày trước", unread: false, projectId: "smart-campus-management", documentTitle: "Activity Diagram" },
  ],
})

const load = (): State => {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as Partial<State>
      if (Array.isArray(s.notifications)) return { notifications: s.notifications }
    }
  } catch {
    /* fall through to seed */
  }
  return seed()
}

let state: State = load()
const listeners = new Set<() => void>()
const emit = (next: State) => {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

let seq = 0
const uid = (prefix: string) => `${prefix}-${Date.now()}-${seq++}`

export function useNotifications() {
  return useSyncExternalStore(subscribe, () => state.notifications)
}

export const getStudentUnread = () => state.notifications.filter((n) => n.unread).length

export const notificationActions = {
  push(input: Omit<StudentNotification, "id" | "unread">) {
    const n: StudentNotification = { ...input, id: uid("sn"), unread: true }
    emit({ notifications: [n, ...state.notifications] })
  },
  markRead(id: string) {
    emit({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, unread: false } : n)) })
  },
  markAllRead() {
    emit({ notifications: state.notifications.map((n) => ({ ...n, unread: false })) })
  },
}

export const resetNotifications = () => {
  state = seed()
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l())
}
