import { AlertCircle, ChevronLeft, ChevronRight, Download, ExternalLink, FileText, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { toast } from "@/components/ui/Toast"
import type { ReviewRequest } from "@/types"

/**
 * Read-only preview of the submitted PDF / DOCX file. The supervisor reads
 * the document as rendered pages; no diagram editing or canvas controls.
 */
export default function DocumentViewer({ review, className = "" }: { review: ReviewRequest; className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<(HTMLElement | null)[]>([])
  const [page, setPage] = useState(1)
  const [hasError, setHasError] = useState(false)
  const total = review.pageCount
  const downloadMetadata = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ prototype: true, document: review.documentTitle, version: review.version, fileName: review.fileName, fileType: review.fileType, fileSize: review.fileSize, submittedAt: review.submittedAt }, null, 2)], { type: "application/json" }))
    const link = document.createElement("a")
    link.href = url
    link.download = `${review.fileName}.metadata.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast("Đã xuất metadata demo. Prototype không lưu nội dung file gốc.")
  }

  useEffect(() => {
    if (hasError) return
    const root = scrollRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setPage(Number((visible.target as HTMLElement).dataset.page))
      },
      { root, threshold: [0.35, 0.6] },
    )
    pageRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [total, hasError])

  const goTo = (n: number) => {
    const target = Math.min(Math.max(n, 1), total)
    pageRefs.current[target - 1]?.scrollIntoView({ behavior: "smooth", block: "start" })
    setPage(target)
  }

  // Minimum 48x48 dp mobile touch target for all toolbar actions
  const btn = "inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center whitespace-nowrap gap-1.5 rounded-[8px] border border-line bg-white px-3 text-[13px] font-medium text-ink hover:bg-subtle active:scale-95 disabled:opacity-40 transition"

  return (
    <section aria-label="Bản xem trước tài liệu" className={`flex min-h-0 flex-col overflow-hidden rounded-[12px] border border-line bg-white ${className}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-48">
          <FileText size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
          <span className="truncate text-[13px] font-medium text-ink">{review.fileName}</span>
          <Badge>{review.fileType === "PDF" ? "PDF" : "Word"}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" className={btn} onClick={() => goTo(page - 1)} disabled={hasError || page <= 1} aria-label="Trang trước">
            <ChevronLeft size={18} strokeWidth={2} />
            <span className="hidden 2xl:inline">Trang trước</span>
          </button>
          <span className="min-w-[84px] whitespace-nowrap text-center text-[13px] font-semibold text-ink tabular-nums">
            Trang {page} / {total}
          </span>
          <button type="button" className={btn} onClick={() => goTo(page + 1)} disabled={hasError || page >= total} aria-label="Trang sau">
            <span className="hidden 2xl:inline">Trang sau</span>
            <ChevronRight size={18} strokeWidth={2} />
          </button>
          <span className="mx-0.5 hidden h-6 w-px bg-line sm:block" />
          <button type="button" className={btn} aria-label="Tải metadata demo" onClick={downloadMetadata}>
            <Download size={18} strokeWidth={1.75} />
            <span className="hidden 2xl:inline">Tải metadata</span>
          </button>
          <button
            type="button"
            className={btn}
            aria-label={hasError ? "Xem tài liệu bình thường" : "Mô phỏng lỗi file"}
            title="Nhấn để kiểm tra trạng thái lỗi tài liệu"
            onClick={() => setHasError(!hasError)}
          >
            {hasError ? <RefreshCw size={16} /> : <AlertCircle size={16} className="text-muted" />}
          </button>
        </div>
      </div>

      {hasError ? (
        <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center gap-3 p-8 text-center bg-subtle">
          <div className="flex size-14 items-center justify-center rounded-full bg-rust-soft text-danger">
            <AlertCircle size={28} />
          </div>
          <div className="flex flex-col gap-1 max-w-sm">
            <p className="text-[16px] font-bold text-ink">Không thể tải tài liệu</p>
            <p className="text-[13px] text-muted leading-relaxed">
              File có thể không còn khả dụng hoặc kết nối đã bị gián đoạn.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button variant="secondary" className="w-auto px-4" onClick={() => setHasError(false)}>
              Thử lại
            </Button>
            <Button className="w-auto px-4" onClick={downloadMetadata}>
              Tải metadata demo
            </Button>
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-subtle px-3 py-4 sm:px-6">
          <div className="mx-auto flex max-w-[640px] flex-col gap-4">
            {Array.from({ length: total }, (_, i) => (
              <article
                key={i}
                data-page={i + 1}
                ref={(el) => {
                  pageRefs.current[i] = el
                }}
                className="relative flex aspect-[1/1.414] w-full scroll-mt-4 flex-col overflow-hidden rounded-[4px] border border-line bg-white px-[8%] pt-[8%] pb-[6%] text-ink"
              >
                <PageContent index={i} review={review} />
                <span className="mt-auto pt-3 text-center text-[10px] text-muted">
                  {review.documentTitle} · {review.version} — {i + 1}
                </span>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

const H = ({ children }: { children: ReactNode }) => <h3 className="mb-2 text-[13px] font-semibold sm:text-[15px]">{children}</h3>
const P = ({ children }: { children: ReactNode }) => <p className="mb-2 text-[10px] leading-[1.6] text-[#3b4a44] sm:text-[11.5px]">{children}</p>

function PageContent({ index, review }: { index: number; review: ReviewRequest }) {
  const title = review.documentTitle
  switch (index) {
    case 0:
      return (
        <div className="flex flex-1 flex-col justify-center gap-2 text-center">
          <p className="text-[10px] font-semibold tracking-wide text-muted">{review.classCode} · {review.groupName.toUpperCase()}</p>
          <h2 className="text-[18px] font-semibold sm:text-[24px]">{title}</h2>
          <p className="text-[12px] sm:text-[14px]">{review.projectName}</p>
          <p className="mt-4 text-[10px] text-muted">Version {review.version} · Người nộp: {review.submitter}</p>
          <p className="text-[10px] text-muted">{review.submittedAt}</p>
        </div>
      )
    case 1:
      return (
        <>
          <H>Mục lục</H>
          {["1. Giới thiệu", "2. Phạm vi hệ thống", "3. Actor", "3.1 Danh sách Actor", "3.2 Use Case", "3.2.1 Submit Document", "4. Diagram tổng quan", "5. Đặc tả Use Case", "6. Functional Requirement liên quan"].map((t, i) => (
            <div key={t} className="flex justify-between border-b border-dotted border-line py-1 text-[10px] sm:text-[11.5px]">
              <span className={t.split(" ")[0].includes(".") && t.split(" ")[0].length > 2 ? "pl-3" : ""}>{t}</span>
              <span className="text-muted">{i + 3}</span>
            </div>
          ))}
        </>
      )
    case 2:
      return (
        <>
          <H>1. Giới thiệu</H>
          <P>Tài liệu mô tả {title} của hệ thống {review.projectName}. Nội dung trình bày các Actor, Use Case chính và quan hệ Include / Extend / Association giữa chúng.</P>
          <P>Tài liệu được xây dựng dựa trên bộ Functional Requirement FR-01 đến FR-08 và các Non-functional Requirement đã thống nhất với giảng viên hướng dẫn.</P>
          <H>2. Phạm vi hệ thống</H>
          <P>Hệ thống hỗ trợ Student upload tài liệu, gửi yêu cầu review và nhận feedback; Supervisor theo dõi tiến độ và đưa ra quyết định review.</P>
        </>
      )
    case 6:
    case 7:
      return (
        <>
          <H>{index === 6 ? "4. Diagram tổng quan" : "3.2.1 Use Case Submit Document"}</H>
          <figure className="my-2 flex flex-col items-center gap-2">
            <StaticDiagram />
            <figcaption className="text-[9px] text-muted sm:text-[10px]">Hình {index === 6 ? "4.1" : "3.2"} — {title} (hình ảnh trong tài liệu)</figcaption>
          </figure>
          <P>Actor Student thực hiện Login, Upload Document và Submit Document. Actor Supervisor thực hiện Review Document và Approve Document.</P>
        </>
      )
    case 8:
      return (
        <>
          <H>5. Đặc tả Use Case</H>
          <table className="w-full border-collapse text-left text-[9px] sm:text-[10.5px]">
            <tbody>
              {[
                ["Use Case", "Submit Document"],
                ["Actor", "Student"],
                ["Tiền điều kiện", "Student đã Login và Upload Document thành công."],
                ["Luồng chính", "1. Chọn tài liệu · 2. Chọn version · 3. Gửi yêu cầu review"],
                ["Hậu điều kiện", "Yêu cầu review được tạo, AI Review bắt đầu."],
                ["Include", "Upload Document"],
              ].map(([k, v]) => (
                <tr key={k}>
                  <th className="w-[32%] border border-line bg-subtle px-2 py-1.5 font-semibold">{k}</th>
                  <td className="border border-line px-2 py-1.5">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )
    default:
      return (
        <>
          <H>{["", "", "", "3. Actor", "3.1 Danh sách Actor", "3.2 Use Case", "", "", "", "6. Functional Requirement liên quan", "6.1 Non-functional Requirement", "Phụ lục"][index] || `Phụ lục ${index}`}</H>
          <P>Student là người dùng thuộc nhóm project, có quyền upload tài liệu và gửi yêu cầu review cho Supervisor được phân công.</P>
          <P>Supervisor là giảng viên hướng dẫn, đọc tài liệu, xem kết quả AI Review và đưa ra quyết định Phê duyệt, Yêu cầu chỉnh sửa hoặc Không đạt.</P>
          <P>FR-03: Hệ thống cho phép Student upload file PDF hoặc DOCX tối đa 20MB. FR-05: Student chỉ gửi yêu cầu review khi tài liệu phụ thuộc đã được phê duyệt.</P>
          <P>AI Review hỗ trợ phát hiện Missing Element, Incorrect Relationship và Naming Issue nhưng không thay thế quyết định của Supervisor.</P>
        </>
      )
  }
}

/** A flattened image of the student's diagram — not interactive. */
function StaticDiagram() {
  const cases = ["Login", "Manage Project", "Upload Document", "Submit Document", "Review Document"]
  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-[420px]" role="img" aria-label="Hình diagram trong tài liệu">
      <rect x="80" y="8" width="160" height="184" rx="6" fill="none" stroke="#c9d3ce" />
      <text x="160" y="22" textAnchor="middle" fontSize="8" fill="#66736d">Smart Attendance System</text>
      {[{ x: 36, y: 70, n: "Student" }, { x: 284, y: 120, n: "Supervisor" }].map((a) => (
        <g key={a.n} stroke="#24332d" strokeWidth="1.2" fill="none">
          <circle cx={a.x} cy={a.y - 18} r="6" />
          <line x1={a.x} y1={a.y - 12} x2={a.x} y2={a.y + 6} />
          <line x1={a.x - 9} y1={a.y - 6} x2={a.x + 9} y2={a.y - 6} />
          <line x1={a.x} y1={a.y + 6} x2={a.x - 7} y2={a.y + 18} />
          <line x1={a.x} y1={a.y + 6} x2={a.x + 7} y2={a.y + 18} />
          <text x={a.x} y={a.y + 30} textAnchor="middle" fontSize="8" stroke="none" fill="#24332d">{a.n}</text>
        </g>
      ))}
      {cases.map((c, i) => {
        const y = 42 + i * 33
        return (
          <g key={c}>
            <line x1={i < 4 ? 46 : 274} y1={i < 4 ? 64 : 112} x2={i < 4 ? 100 : 220} y2={y} stroke="#9aa8a1" strokeWidth="0.8" />
            <ellipse cx="160" cy={y} rx="60" ry="12" fill="#f7f9f7" stroke="#24332d" strokeWidth="0.9" />
            <text x="160" y={y + 3} textAnchor="middle" fontSize="8" fill="#24332d">{c}</text>
          </g>
        )
      })}
    </svg>
  )
}
