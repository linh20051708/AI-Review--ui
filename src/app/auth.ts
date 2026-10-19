import { useSyncExternalStore } from "react"

export type Role = "supervisor" | "student"

const KEY = "project-review:session"

interface Session {
  studentId?: string
  classId?: string
  role: Role
}

const read = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY)
    // Legacy value from the supervisor-only build: keep it as supervisor.
    if (raw === "1") return { role: "supervisor" }
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Session>
    if (s && (s.role === "supervisor" || s.role === "student")) return { role: s.role, studentId: s.studentId, classId: s.classId }
    return null
  } catch {
    return null
  }
}

export const getSession = (): Session | null => read()
export const isAuthenticated = (): boolean => read() !== null
export const currentRole = (): Role => read()?.role ?? "supervisor"
export const signIn = (role: Role, studentId?: string): void => { localStorage.setItem(KEY, JSON.stringify({ role, studentId })); changed() }
export const signOut = (): void => { localStorage.removeItem(KEY); changed() }

export const selectStudentClass = (classId: string) => { localStorage.setItem(KEY, JSON.stringify({ ...read(), classId })); changed() }

function changed() { if (typeof window !== "undefined") window.dispatchEvent(new Event("project-review:session-change")) }
const subscribeSession = (listener: () => void) => {
  window.addEventListener("project-review:session-change", listener)
  window.addEventListener("storage", listener)
  return () => { window.removeEventListener("project-review:session-change", listener); window.removeEventListener("storage", listener) }
}
const sessionSnapshot = () => { try { return localStorage.getItem(KEY) } catch { return null } }
export function useSession() { useSyncExternalStore(subscribeSession, sessionSnapshot, () => null); return read() }
