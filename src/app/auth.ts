const KEY = "project-review:session"

export const isAuthenticated = () => localStorage.getItem(KEY) === "1"
export const signIn = () => localStorage.setItem(KEY, "1")
export const signOut = () => localStorage.removeItem(KEY)
