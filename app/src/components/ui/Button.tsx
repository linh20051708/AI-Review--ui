import { Loader2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { Link } from "react-router-dom"

type Variant = "primary" | "secondary" | "danger"

const variants: Record<Variant, string> = {
  primary: "border-brand bg-brand text-white hover:bg-brand-hover active:bg-brand-hover",
  secondary: "border-line bg-white text-ink hover:bg-subtle active:bg-subtle",
  danger: "border-line bg-white text-danger hover:bg-rust-soft active:bg-rust-soft",
}

// Ensure minimum mobile touch target is 48x48 dp (min-h-12 min-w-12)
const base =
  "inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-[8px] border px-4 py-3 text-[14px] font-semibold leading-[1.45] transition active:scale-[0.985] active:brightness-95 disabled:pointer-events-none disabled:opacity-50"

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
  to?: string
  loading?: boolean
}

export default function Button({
  variant = "primary",
  icon,
  to,
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: Props) {
  const classes = `${base} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {icon}
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 size={18} className="animate-spin shrink-0" /> : icon}
      {children}
    </button>
  )
}
