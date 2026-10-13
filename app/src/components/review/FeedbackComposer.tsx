import { useEffect, useState } from "react"
import Button from "@/components/ui/Button"
import { ChoiceChips, Field, Select, TextArea, TextInput } from "@/components/ui/Form"
import { feedbackCategories } from "@/data/mockData"
import type { FeedbackSeverity } from "@/types"

export interface FeedbackDraft {
  message: string
  severity: FeedbackSeverity
  category: string
  pageRef: string
}

interface Props {
  initial?: Partial<FeedbackDraft>
  onSubmit: (draft: FeedbackDraft) => void
}

export default function FeedbackComposer({ initial, onSubmit }: Props) {
  const [draft, setDraft] = useState<FeedbackDraft>({ message: "", severity: "Major", category: feedbackCategories[0], pageRef: "", ...initial })
  useEffect(() => {
    if (initial) setDraft((d) => ({ ...d, ...initial }))
  }, [initial])
  const set = <K extends keyof FeedbackDraft>(k: K, v: FeedbackDraft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <form
      className="flex flex-col gap-3 rounded-[10px] border border-line bg-brand-tint p-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (!draft.message.trim()) return
        onSubmit({ ...draft, message: draft.message.trim() })
        setDraft((d) => ({ ...d, message: "", pageRef: "" }))
      }}
    >
      <Field label="Nội dung feedback" required>
        <TextArea rows={3} value={draft.message} onChange={(e) => set("message", e.target.value)} placeholder="Relationship giữa Student và Submit Document chưa đúng." />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Tham chiếu">
          <TextInput value={draft.pageRef} onChange={(e) => set("pageRef", e.target.value)} placeholder="Trang 8 / Mục 3.2.1" />
        </Field>
        <Field label="Category">
          <Select options={feedbackCategories} value={draft.category} onChange={(e) => set("category", e.target.value)} />
        </Field>
      </div>
      <Field label="Mức độ">
        <ChoiceChips<FeedbackSeverity> options={["Minor", "Major", "Critical"]} value={draft.severity} onChange={(v) => set("severity", v)} />
      </Field>
      <Button type="submit" disabled={!draft.message.trim()} className="disabled:opacity-50">Thêm feedback</Button>
    </form>
  )
}
