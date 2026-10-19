import { documentSample } from "@/data/documentSamples"
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import type { ReviewRequest } from "@/types"

/** Existing sample pages, shared by inline and fullscreen presentation. */
export default function SampleDocumentPreview({ review }: { review: ReviewRequest }) {
  const [page, setPage] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const readingOffset = useRef<number | null>(null)
  const total = Math.max(1, review.pageCount)
  const button = "inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-line bg-white text-ink disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-brand"
  const close = () => {
    if (window.history.state?.documentFullscreen) window.history.back()
    else setFullscreen(false)
  }
  useEffect(() => {
    if (!fullscreen) return
    const dialog = dialogRef.current
    const previousFocus = document.activeElement as HTMLElement | null
    window.history.pushState({ ...window.history.state, documentFullscreen: true }, "")
    const onBack = () => setFullscreen(false)
    window.addEventListener("popstate", onBack)
    const background = dialog?.closest<HTMLElement>(".mobile-content")
    const previousOverflow = background?.style.overflow
    if (background) background.style.overflow = "hidden"
    dialog?.showModal()
    const reader = scrollRef.current
    const startPage = reader?.querySelector<HTMLElement>('[data-page="' + page + '"]')
    if (reader) reader.scrollTop = readingOffset.current ?? (startPage ? startPage.getBoundingClientRect().top - reader.getBoundingClientRect().top + reader.scrollTop - 12 : 0)
    return () => {
      window.removeEventListener("popstate", onBack)
      if (background) background.style.overflow = previousOverflow ?? ""
      dialog?.close()
      if (window.history.state?.documentFullscreen) window.history.back()
      if (openerRef.current) openerRef.current.focus({ preventScroll: true })
      else previousFocus?.focus({ preventScroll: true })
    }
  }, [fullscreen])


  const viewer = (
    <section aria-labelledby={fullscreen ? "fullscreen-document-title" : "document-content-title"} data-review-id={review.id} data-document-id={review.documentId} data-version={review.version} className={fullscreen ? "flex h-full min-h-0 min-w-0 flex-col bg-white" : "min-w-0 rounded-xl border border-line bg-white"}>
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-line p-3">
        <h2 id={fullscreen ? "fullscreen-document-title" : "document-content-title"} className="text-[16px] font-semibold">Nội dung tài liệu</h2>
        {fullscreen ? <button type="button" className={button} onClick={close} aria-label="Đóng toàn màn hình"><X size={20} /></button> : <span className="rounded bg-subtle px-2 py-1 text-[14px] text-muted">Nội dung mẫu</span>}
        {!fullscreen && <p className="basis-full break-all text-[14px] text-muted">{review.fileName} · {review.version}</p>}
      </div>
      {!fullscreen && <div role="group" aria-label="Điều hướng tài liệu" className="flex shrink-0 items-center justify-between gap-2 border-b border-line p-3">
        <button type="button" className={button} aria-label="Trang trước" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft size={20} /></button>
        <span role="status" aria-live="polite" className="text-[14px] font-semibold">Trang {page} / {total}</span>
        <button type="button" className={button} aria-label="Trang sau" disabled={page >= total} onClick={() => setPage(p => Math.min(total, p + 1))}><ChevronRight size={20} /></button>
        {!fullscreen && <button ref={openerRef} type="button" className={button} aria-label="Phóng to tài liệu" title="Toàn màn hình" onClick={() => setFullscreen(true)}><Maximize size={20} /></button>}
      </div>}
      <div ref={fullscreen ? scrollRef : undefined} onScroll={fullscreen ? event => { readingOffset.current = event.currentTarget.scrollTop } : undefined} style={fullscreen ? { WebkitOverflowScrolling: "touch", touchAction: "pan-y" } : undefined} role="region" aria-label="Vùng đọc tài liệu" tabIndex={fullscreen ? 0 : undefined} className={fullscreen ? "min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain bg-subtle p-3 sm:p-5" : "min-w-0 bg-subtle p-3 sm:p-5"}>
        <div className="mx-auto flex min-w-0 max-w-[640px] flex-col gap-4">
          {(fullscreen ? Array.from({ length: total }, (_, index) => index + 1) : [page]).map(number => (
            <article key={number} data-page={number} aria-label={`Trang ${number}`} className="flex min-h-[360px] min-w-0 flex-col gap-1 break-words rounded border border-line bg-white p-4 text-[14px] leading-relaxed sm:p-8">
              <PageContent index={number - 1} review={review} />
              {!fullscreen && <p className="mt-auto pt-4 text-center text-[14px] text-muted">{review.documentTitle} · {review.version} — {number}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
  return <>
    <div hidden={fullscreen}>{!fullscreen && viewer}</div>
    <dialog ref={dialogRef} aria-label="Nội dung tài liệu toàn màn hình" onCancel={event => { event.preventDefault(); close() }} className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden border-0 bg-white p-0 text-ink backdrop:bg-white" style={{ paddingTop: "var(--app-safe-top, env(safe-area-inset-top, 0px))", paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingLeft: "env(safe-area-inset-left, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}>
      {fullscreen && viewer}
    </dialog>
  </>
}

const H = ({ children }: { children: ReactNode }) => <h3 className="mb-2 text-[14px] font-semibold sm:text-[15px]">{children}</h3>
const P = ({ children }: { children: ReactNode }) => <p className="mb-2 text-[14px] leading-[1.6] text-[#3b4a44] sm:text-[14px]">{children}</p>

function PageContent({ index, review }: { index: number; review: ReviewRequest }) {
  const title = review.documentTitle
  const sample = documentSample(title)
  if (sample.kind !== "other" && index > 0) {
    const perPage = Math.ceil(sample.checks.length / Math.max(1, review.pageCount - 1))
    const checks = sample.checks.slice((index - 1) * perPage, index * perPage)
    return <>
      {/use case/i.test(title) && index === 1 && <figure className="mb-4"><StaticDiagram projectName={review.projectName} /><figcaption className="text-[14px] text-muted">Use Case tổng quan</figcaption></figure>}
      {checks.length ? checks.map(c => <section key={c.key}><H>{c.name}</H><P>{c.text}</P></section>) : <><H>Phụ lục · {title}</H><P>Tham chiếu các mục nội dung ở đầu tài liệu. Không có ghi chú bổ sung cho trang này.</P></>}
    </>
  }
  switch (index) {
    case 0:
      return (
        <div className="flex flex-1 flex-col justify-center gap-2 text-center">
          <p className="text-[14px] font-semibold tracking-wide text-muted">{review.classCode} · {review.groupName.toUpperCase()}</p>
          <h2 className="text-[18px] font-semibold sm:text-[24px]">{title}</h2>
          <p className="text-[14px] sm:text-[14px]">{review.projectName}</p>
          <p className="mt-4 text-[14px] text-muted">Version {review.version} · Người nộp: {review.submitter}</p>
          <p className="text-[14px] text-muted">{review.submittedAt}</p>
        </div>
      )
    case 1:
      return (
        <>
          <H>Mục lục</H>
          {["1. Giới thiệu", "2. Phạm vi hệ thống", "3. Actor", "3.1 Danh sách Actor", "3.2 Use Case", "3.2.1 Submit Document", "4. Diagram tổng quan", "5. Đặc tả Use Case", "6. Functional Requirement liên quan"].map((t, i) => (
            <div key={t} className="flex justify-between border-b border-dotted border-line py-1 text-[14px] sm:text-[14px]">
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
            <figcaption className="text-[14px] text-muted sm:text-[14px]">Hình {index === 6 ? "4.1" : "3.2"} — {title} (hình ảnh trong tài liệu)</figcaption>
          </figure>
          <P>Actor Student thực hiện Login, Upload Document và Submit Document. Actor Supervisor thực hiện Review Document và Approve Document.</P>
        </>
      )
    case 8:
      return (
        <>
          <H>5. Đặc tả Use Case</H>
          <table className="w-full border-collapse text-left text-[14px] sm:text-[14px]">
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
function StaticDiagram({ projectName = "Hệ thống review tài liệu" }: { projectName?: string }) {
  const cases = ["Login", "Manage Project", "Upload Document", "Submit Document", "Review Document"]
  return (
    <svg viewBox="0 0 320 200" className="w-full max-w-[420px]" role="img" aria-label="Hình diagram trong tài liệu">
      <rect x="80" y="8" width="160" height="184" rx="6" fill="none" stroke="#c9d3ce" />
      <text x="160" y="22" textAnchor="middle" fontSize="8" fill="#66736d">{projectName.length > 28 ? projectName.slice(0, 25) + "…" : projectName}</text>
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

