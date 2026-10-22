import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { Check } from "lucide-react"
import uiLabel from "@/lib/uiLabels"

const field =
  "w-full rounded-[8px] border border-muted bg-white p-3 text-[16px] leading-[1.45] text-ink outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-subtle disabled:text-muted disabled:cursor-not-allowed"

export function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[14px] font-semibold text-ink">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      {children}
      {error ? (
        <span className="text-[12px] font-medium text-danger">{error}</span>
      ) : hint ? (
        <span className="text-[12px] text-muted">{hint}</span>
      ) : null}
    </label>
  )
}

export function TextArea({
  className = "",
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${field} resize-none placeholder:text-muted ${error ? "border-danger focus:border-danger focus:ring-danger" : ""} ${className}`}
    />
  )
}

export function Select({
  options,
  className = "",
  error,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; error?: boolean }) {
  return (
    <select
      {...props}
      className={`${field} min-h-12 ${error ? "border-danger focus:border-danger focus:ring-danger" : ""} ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>{uiLabel(o)}</option>
      ))}
    </select>
  )
}

export function TextInput({
  className = "",
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`${field} min-h-12 placeholder:text-muted ${error ? "border-danger focus:border-danger focus:ring-danger" : ""} ${className}`}
    />
  )
}

export function ChoiceChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`min-h-12 rounded-[8px] border px-4 py-2.5 text-[14px] font-medium transition ${
            o === value
              ? "border-brand bg-brand-soft text-brand font-semibold"
              : "border-line bg-white text-ink hover:bg-subtle"
          }`}
        >
            {o === value && <Check size={16} aria-hidden="true" className="mr-1 inline-block" />}
          {uiLabel(o)}
        </button>
      ))}
    </div>
  )
}
