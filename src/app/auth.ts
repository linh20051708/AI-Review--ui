export type Role = "supervisor" | "student"

const KEY = "project-review:session"

interface Session {
  role: Role
}

const read = (): Session | null => {
  try {
    const raw = localStorage.getItem(KEY)
    // Legacy value from the supervisor-only build: keep it as supervisor.
    if (raw === "1") return { role: "supervisor" }
    if (!raw) return null
    const s = JSON.parse(raw) as Partial<Session>
    if (s && (s.role === "supervisor" || s.role === "student")) return { role: s.role }
    return null
  } catch {
    return null
  }
}

export const getSession = (): Session | null => read()
export const isAuthenticated = (): boolean => read() !== null
export const currentRole = (): Role => read()?.role ?? "supervisor"
export const signIn = (role: Role): void => localStorage.setItem(KEY, JSON.stringify({ role }))
export const signOut = (): void => localStorage.removeItem(KEY)
