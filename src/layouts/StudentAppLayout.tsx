import { useEffect, useRef } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import StudentBottomNavigation from "@/components/layout/StudentBottomNavigation"
import StudentMobileHeader from "@/components/layout/StudentMobileHeader"
import Toaster from "@/components/ui/Toast"
import { currentRole, isAuthenticated } from "@/app/auth"

/** Role-aware layout for the Student experience (mobile-first, same design language as Supervisor). */
export default function StudentAppLayout() {
  const location = useLocation()
  const contentRef = useRef<HTMLElement>(null)

  // The document never scrolls, so reset the content pane on route change.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  // Students cannot open Supervisor routes and vice-versa.
  if (currentRole() !== "student") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="mobile-app student-app">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <StudentMobileHeader />
        <main ref={contentRef} className="mobile-content">
          <div className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-5 pt-5 pb-8">
            <Outlet />
          </div>
        </main>
        <StudentBottomNavigation />
      </div>
      <Toaster />
    </div>
  )
}
