import { useEffect, useState } from "react"
import Card from "@/components/ui/Card"
import Notice from "@/components/ui/Notice"
import type { ReviewRequest } from "@/types"

/** Local-only evidence inspection. No upload, parsing, or AI access to file bytes. */
export default function OriginalDocumentPanel({
  review,
}: {
  review: ReviewRequest
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
      <h3 className="text-[14px] font-semibold">
        Đối chiếu file gốc · {review.fileName}
      </h3>
      <Notice>
        Prototype chỉ lưu metadata của bản nộp. Chọn bản gốc tương ứng trên máy
        để kiểm tra evidence; file không gửi tới AI hoặc máy chủ. Preview minh
        họa bên dưới không phải nội dung file gốc.
      </Notice>
      <label className="flex min-h-12 flex-col gap-2 text-[14px]">
        Chọn file gốc PDF/DOCX
        <input
          aria-label="File gốc để đối chiếu evidence"
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
            ? "Tên khác metadata bản nộp: cần tự xác nhận đúng tài liệu/version."
            : "Tên trùng metadata; chưa xác minh nội dung hoặc checksum."}
        </p>
      )}
      {url && file?.name.toLowerCase().endsWith(".pdf") && (
        <iframe
          title="File PDF gốc do Supervisor chọn"
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
          Mở bản sao file gốc bằng ứng dụng trên máy
        </a>
      )}
      {file?.name.toLowerCase().endsWith(".docx") && (
        <Notice>
          DOCX chưa có trình render trong app. Mở bản sao bằng Word để đối
          chiếu; AI mô phỏng không đọc nội dung.
        </Notice>
      )}
    </Card>
  )
}
