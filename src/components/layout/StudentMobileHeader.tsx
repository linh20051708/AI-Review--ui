import { Files } from "lucide-react"
import { Link } from "react-router-dom"

export default function StudentMobileHeader() {
  return (
    <header className="mobile-header w-full border-b border-line">
      <div className="mobile-header-inner justify-center px-4 sm:px-5">
        <Link to="/student/dashboard" className="flex min-w-0 items-center gap-2.5 min-h-12 py-1">
          <Files size={24} strokeWidth={1.75} className="shrink-0 text-brand" />
          <span className="truncate text-[17px] font-semibold text-ink">SRS Đánh giá AI</span>
        </Link>
      </div>
    </header>
  )
}
