import { useEffect, useState } from "react"

import Card from "@/components/ui/Card"



import type { ReviewRequest } from "@/types"

/** Local-only evidence inspection. No upload, parsing, or AI access to file bytes. */

export default function OriginalDocumentPanel({
  review,

  compact = false,
}: {
  review: ReviewRequest

  compact?: boolean
}) {
  const [file, setFile] = useState<File | null>(null)

  const [url, setUrl] = useState("")

  const [error, setError] = useState("")

  useEffect(() => {
    if (!file) return

    const local = URL.createObjectURL(file)

    setUrl(local)

    return () => URL.revokeObjectURL(local)
  }, [file])

  return (
    <Card>
      <h2 className="text-[14px] font-semibold">
        Đối chiếu tệp gốc{!compact && ` · ${review.fileName}`}
      </h2>
      <label className="flex min-h-12 flex-col gap-2 text-[14px]">
        {compact ? "Chọn PDF/DOCX · tối đa 50 MB" : "Chọn tệp gốc PDF/DOCX"}
        <input
          aria-label="Tệp gốc để đối chiếu bằng chứng"
          type="file"
          accept=".pdf,.docx"
          className="min-h-12 max-w-full text-[14px]"
          onChange={(e) => {
            const f = e.target.files?.[0]

            setError("")

            setFile(null)

            setUrl("")

            if (!f) return

            if (
              !/\.(pdf|docx)$/i.test(f.name) ||
              !f.size ||
              f.size > 50 * 1024 * 1024
            ) {
              setError("Chọn PDF/DOCX có nội dung, tối đa 50 MB.")

              return
            }

            setFile(f)
          }}
        />
      </label>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      {file && (
        <p className="break-all text-[14px]">
          Đã chọn {file.name}.{" "}
          {file.name !== review.fileName
            ? "Tên tệp khác bản nộp. Kiểm tra đúng phiên bản."
            : "Chưa xác minh nội dung."}
        </p>
      )}
      {url && file?.name.toLowerCase().endsWith(".pdf") && (
        <iframe
          title="Tệp PDF gốc do Giảng viên chọn"
          src={url}
          className="h-[60dvh] w-full rounded-lg border border-line"
        />
      )}
      {url && (
        <a
          className="inline-flex min-h-12 items-center font-semibold text-brand"
          href={url}
          download={file?.name}
        >
          Tải tệp đã chọn
        </a>
      )}
      {file?.name.toLowerCase().endsWith(".docx") && (
        <p className="text-[14px] text-muted">Mở tệp DOCX bằng Word để xem nội dung.</p>
      )}
    </Card>
  )
}
