import { useEffect, useRef } from "react"
import { Navigate, Outlet, useLocation, useMatches } from "react-router-dom"
import BottomNavigation from "@/components/layout/BottomNavigation"
import MobileHeader from "@/components/layout/MobileHeader"
import SideNavigation from "@/components/layout/SideNavigation"
import Toaster from "@/components/ui/Toast"
import { currentRole, isAuthenticated } from "@/app/auth"

export default function MobileAppLayout() {
  const location = useLocation()
  const matches = useMatches()
  const contentRef = useRef<HTMLElement>(null)
  const wide = matches.some((m) => (m.handle as { wide?: boolean } | undefined)?.wide)

  // The document never scrolls, so reset the content pane on route change.
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 })
  }, [location.pathname])

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (currentRole() !== "supervisor") {
    return <Navigate to="/student/dashboard" replace />
  }

  return (
    <div className="mobile-app lg:flex-row">
      <SideNavigation />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main ref={contentRef} className="mobile-content">
          <div className={`mx-auto flex w-full max-w-[480px] flex-col gap-4 px-5 pt-3 ${wide ? "pb-0 lg:max-w-[1440px] lg:px-6" : "pb-8 sm:max-w-[720px] lg:max-w-[880px] lg:px-8 lg:pt-5"}`}>
            <Outlet />
          </div>
        </main>
        <BottomNavigation pathname={location.pathname} />
      </div>
      <Toaster />
    </div>
  )
}
