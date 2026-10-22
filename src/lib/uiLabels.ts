/** Display labels only. Keep persisted values and workflow enums unchanged. */
const labels: Record<string, string> = {
  Minor: "Nhẹ", Major: "Quan trọng", Critical: "Nghiêm trọng",
  "Missing Element": "Thiếu thành phần", "Incorrect Relationship": "Quan hệ chưa đúng",
  "Naming Issue": "Lỗi đặt tên", "Logic Issue": "Lỗi logic", "UML Violation": "Vi phạm UML",
  "Requirement Mismatch": "Chưa khớp yêu cầu", Other: "Khác",
  Document: "Tài liệu", Diagram: "Sơ đồ", Report: "Báo cáo", Both: "PDF và DOCX",
  Hybrid: "Kết hợp trực tiếp và trực tuyến", "Project-based Learning": "Học qua dự án",
  "Flipped Classroom": "Lớp học đảo ngược", "Blended Learning": "Học tập kết hợp",
}
export default function uiLabel(value: string | undefined): string {
  return value ? labels[value] ?? value : "—"
}
