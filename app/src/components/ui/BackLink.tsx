import { ChevronLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function BackLink({ label, fallback }: { label: string; fallback: string }) {
  const navigate = useNavigate()
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate(fallback))
  return (
    <button
      type="button"
      onClick={goBack}
      className="-ml-2 inline-flex min-h-12 min-w-12 items-center gap-1.5 self-start px-2 text-[14px] font-medium text-muted hover:text-brand active:scale-[0.98] transition"
      aria-label={`Quay lại ${label}`}
    >
      <ChevronLeft size={20} strokeWidth={2} className="shrink-0" />
      <span>{label}</span>
    </button>
  )
}
