import { fmtRelative } from "@/lib/time"
import uiLabel from "@/lib/uiLabels"
/** Presentation only: remove stock implementation copy without changing stored records. */
export function contentText(value: string | undefined): string {
  return (value ?? "")
    .replace(/\(Finding mô phỏng, chưa đọc file gốc\.\)/g, "")
    .replace(/;\s*chỉ mô phỏng ở bản demo\./g, ".")
    .replace(/Gợi ý mô phỏng:\s*/g, "Gợi ý: ")
    .replace(/Dữ liệu demo mô phỏng; chưa đọc file tài liệu thực tế\./g, "")
    .replace(/AI Review mô phỏng hoàn tất/g, "AI có kết quả đề xuất")
    .replace(/AI \(mô phỏng\)/g, "AI")
    .replace(/AI mô phỏng[^.]*chưa đọc file[^.]*\.?/gi, "Kết quả minh họa")
    .replace(/AI mô phỏng/gi, "Đánh giá AI")
    .replace(/AI Evaluation mô phỏng/gi, "Đánh giá AI")
    .replace(/ — Demo\b/g, "")
    .replace(/\bAI (?:Review|Evaluation)\b/gi, "Đánh giá AI")
    .replace(/\breview\b/gi, "đánh giá")
    .replace(/\bfeedback\b/gi, "phản hồi")
    .replace(/\bversion\b/gi, "phiên bản")
    .replace(/\bproject\b/gi, "dự án")
    .replace(/\bSupervisor\b/gi, "giảng viên")
    .replace(/\bdeadline\b/gi, "hạn nộp")
    .replace(/\bfile\b/gi, "tệp")
    .replace(/\s{2,}/g, " ")
    .trim()
}

export function ruleDescription(value: string | undefined): string {
  // Extended stock rubric explanations are not instructions for completing a review.
  if (/rubric đề xuất của giảng viên|prototype|dữ liệu demo|mô phỏng/i.test(value ?? "")) return ""
  return contentText(value)
}

/** Short headings are presentation-only; the full criterion remains in the panel. */
export function shortCriterion(name: string) {
  const labels: Record<string, string> = {
    "Đã xác định phạm vi sản phẩm, các tác vụ trọng tâm và nhóm người dùng liên quan.":
      "Phạm vi & người dùng",
    "Có User/Stakeholder Map và đã cân nhắc người dùng dễ bị bỏ sót.":
      "Bản đồ người dùng",
    "Số Persona phù hợp phạm vi; nếu chỉ có 1 thì có lý giải dựa trên nghiên cứu.":
      "Số lượng Persona",
    "Persona được phân biệt bằng goals, behaviors, contexts hoặc constraints thật sự.":
      "Khác biệt Persona",
    "Mỗi Persona có đủ 12 trường cốt lõi, ngắn gọn và dễ sử dụng.":
      "Thông tin Persona",
    "Nhu cầu được mô tả theo kết quả mong muốn, không ngụy trang một tính năng thành nhu cầu.":
      "Nhu cầu & kết quả",
    "Có bằng chứng nghiên cứu hoặc gắn nhãn rõ những giả định chưa được kiểm chứng.":
      "Bằng chứng & giả định",
    "Có Affinity Board hoặc tổng hợp pattern chứng minh cách hình thành phân khúc.":
      "Tổng hợp nghiên cứu",
    "Mỗi Primary Persona có scenario và success criteria cụ thể.":
      "Kịch bản & mục tiêu",
    "Có ít nhất một quyết định/giả thuyết UI và phương pháp kiểm chứng liên kết đến Persona.":
      "Quyết định & kiểm chứng",
  }
  return (
    labels[name] ?? (uiLabel(name) !== name ? uiLabel(name) : undefined) ??
    (name.length > 64 ? name.slice(0, 61).replace(/\s+\S*$/, "") + "…" : name)
  )
}


export function activityText(value: string): string {
  const ts = Date.parse(value)
  return /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(ts) ? fmtRelative(ts) : value
}
