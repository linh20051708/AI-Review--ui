import { FileText } from "lucide-react"
import type { ReviewRequest } from "@/types"

/** Only render available submission information; never fabricate document pages. */
export default function DocumentViewer({ review, className = "" }: { review: ReviewRequest; className?: string }) {
  return (
    <section aria-label="Thông tin tài liệu" className={`flex min-w-0 flex-col gap-4 text-[14px] ${className}`}>
      <div className="flex min-w-0 items-start gap-3"><FileText size={22} className="shrink-0 text-muted" aria-hidden="true" /><p className="min-w-0 break-all font-semibold">{review.fileName}</p></div>
      <dl className="grid grid-cols-2 gap-3">
        <div><dt className="text-muted">Phiên bản</dt><dd>{review.version}</dd></div>
        <div><dt className="text-muted">Định dạng</dt><dd>{review.fileType}</dd></div>
        <div><dt className="text-muted">Người nộp</dt><dd>{review.submitter}</dd></div>
        <div><dt className="text-muted">Ngày nộp</dt><dd>{review.submittedAt}</dd></div>
      </dl>
    </section>
  )
}
