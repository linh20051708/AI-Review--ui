import type {
  AIEvaluation,
  ReviewRequest,
  RubricCriterion,
  RuleSet,
} from "@/types"
import {
  resolveLabStructure,
  resolveRuleSet,
  type AcademicConfig,
} from "@/lib/config"

export const newCriterion = (id: string): RubricCriterion => ({
  id,
  name: "",
  description: "",
  maxScore: 10,
  enabled: true,
  required: false,
  critical: false,
  evidenceRequired: true,
  aiEnabled: true,
  instruction: "",
  evidenceRequirement: "",
  suggestScore: true,
  suggestFindings: true,
  suggestSuggestions: true,
})
export const normalizeRule = (r: RuleSet): RuleSet => ({
  version: 1,
  status: "active",
  aiEnabled: true,
  resubmissionEnabled: true,
  documentType: "Tất cả",
  criteria: [],
  passThreshold: 80,
  improveThreshold: 70,
  ...r,
})
const personaCriteria = [
  "Đã xác định phạm vi sản phẩm, các tác vụ trọng tâm và nhóm người dùng liên quan.",
  "Có User/Stakeholder Map và đã cân nhắc người dùng dễ bị bỏ sót.",
  "Số Persona phù hợp phạm vi; nếu chỉ có 1 thì có lý giải dựa trên nghiên cứu.",
  "Persona được phân biệt bằng goals, behaviors, contexts hoặc constraints thật sự.",
  "Mỗi Persona có đủ 12 trường cốt lõi, ngắn gọn và dễ sử dụng.",
  "Nhu cầu được mô tả theo kết quả mong muốn, không ngụy trang một tính năng thành nhu cầu.",
  "Có bằng chứng nghiên cứu hoặc gắn nhãn rõ những giả định chưa được kiểm chứng.",
  "Có Affinity Board hoặc tổng hợp pattern chứng minh cách hình thành phân khúc.",
  "Mỗi Primary Persona có scenario và success criteria cụ thể.",
  "Có ít nhất một quyết định/giả thuyết UI và phương pháp kiểm chứng liên kết đến Persona.",
]
export const personaTemplate: RuleSet = {
  id: "persona-evaluation-100",
  name: "Persona Evaluation — 100 Points",
  description:
    "Rubric đề xuất của giảng viên, phase P2 (Gate G2); không phải tiêu chuẩn chấm điểm chính thức của NN/g. Không tính đủ 5 Persona thành tiêu chí riêng. Gốc: 80–100 đạt; 70 cần cải thiện; dưới 70 cần làm lại. Khoảng 70–79 là quy ước triển khai bổ sung. Trước duyệt UI cần evidence/assumption matrix, khác biệt Persona và scenario. Điểm cao không thay thế nghiên cứu người dùng/usability testing.",
  version: 1,
  status: "active",
  aiEnabled: true,
  aiReview: "manual",
  aiRequiredBeforeSupervisor: true,
  supervisorApproval: true,
  prerequisiteApproval: true,
  resubmissionEnabled: true,
  allowedFormats: ["PDF", "DOCX"],
  maxFileSizeMB: 20,
  reviewSlaDays: 3,
  documentType: "Persona",
  criteria: personaCriteria.map((name, i) => ({
    ...newCriterion(`P${String(i + 1).padStart(2, "0")}`),
    name,
    description: name,
    instruction:
      "Đề xuất 10 điểm nếu đạt, 0 nếu chưa đạt; chỉ mô phỏng ở bản demo. Không kết luận có bằng chứng khi chưa xác minh.",
    evidenceRequirement:
      "Đối chiếu evidence/assumption matrix và nội dung tài liệu gốc; đánh dấu Cần xác minh khi chưa kiểm tra.",
  })),
  passThreshold: 80,
  improveThreshold: 70,
  scoringMode: "binary",
}

export function validateRule(r: RuleSet): string | undefined {
  if (!r.id.trim() || !r.name.trim()) return "Cần ID và tên bộ quy tắc."
  if (
    !r.allowedFormats.length ||
    !Number.isFinite(r.maxFileSizeMB) ||
    r.maxFileSizeMB <= 0 ||
    !Number.isFinite(r.reviewSlaDays) ||
    r.reviewSlaDays <= 0
  )
    return "Định dạng, dung lượng và hạn review phải hợp lệ."
  if (
    r.maxResubmissions !== undefined &&
    (!Number.isInteger(r.maxResubmissions) || r.maxResubmissions < 0)
  )
    return "Số lần nộp lại phải là số nguyên không âm."
  if (r.aiRequiredBeforeSupervisor && !r.aiEnabled)
    return "Không thể bắt buộc AI khi AI bị tắt."
  if (
    !(
      Number.isFinite(r.passThreshold) &&
      Number.isFinite(r.improveThreshold) &&
      r.passThreshold! <= 100 &&
      r.improveThreshold! >= 0 &&
      r.passThreshold! > r.improveThreshold!
    )
  )
    return "Ngưỡng cần cải thiện phải thấp hơn ngưỡng đạt (0–100%)."
  const cs = r.criteria ?? []
  if (
    new Set(cs.map((c) => c.id)).size !== cs.length ||
    cs.some(
      (c) =>
        !c.id.trim() ||
        !c.name.trim() ||
        !Number.isFinite(c.maxScore) ||
        c.maxScore <= 0,
    )
  )
    return "Tiêu chí cần ID duy nhất, tên và điểm tối đa lớn hơn 0."
  if (
    r.status === "active" &&
    (!cs.some((c) => c.enabled) || r.templateMissing)
  )
    return "Cần ít nhất một tiêu chí bật và checklist đầy đủ trước khi kích hoạt."
  if (
    r.status === "active" &&
    r.aiRequiredBeforeSupervisor &&
    !cs.some((c) => c.enabled && c.aiEnabled)
  )
    return "Cần ít nhất một tiêu chí bật AI để bắt buộc AI Review."
  return undefined
}

export function resolveReviewRule(
  review: ReviewRequest,
  cfg: AcademicConfig,
): RuleSet | undefined {
  if (review.ruleSnapshot) return review.ruleSnapshot
  const cls = cfg.classes.find((c) => c.id === review.classId)
  const offering = cfg.offerings.find((o) => o.id === cls?.offeringId)
  const item = resolveLabStructure(cls, offering)
    .flatMap((l) => l.items)
    .find((i) =>
      review.documentId
        ? i.id === review.documentId
        : i.title === review.documentTitle,
    )
  const rule = item?.ruleSetId
    ? cfg.ruleSets.find((r) => r.id === item.ruleSetId)
    : resolveRuleSet(cls, offering, cfg.ruleSets).value
  if (!rule) return undefined
  const result = normalizeRule(structuredClone(rule))
  if (item?.aiReview === "disabled") {
    result.aiEnabled = false
    result.aiRequiredBeforeSupervisor = false
  }
  return result
}

/** Deterministic synthetic scores. Never examines file bytes or claims real evidence. */
export function mockEvaluation(run: AIEvaluation): AIEvaluation {
  const criterionResults = (run.ruleSnapshot.criteria ?? [])
    .filter((c) => c.enabled)
    .map((c) => {
      const hash = [
        ...`${c.id}|${c.name}|${c.instruction}|${run.documentVersion}`,
      ].reduce((n, ch) => n + ch.charCodeAt(0), 0)
      return {
        criterionId: c.id,
        name: c.name,
        maxScore: c.maxScore,
        score:
          c.aiEnabled && c.suggestScore
            ? run.ruleSnapshot.scoringMode === "binary"
              ? hash % 4 === 0
                ? 0
                : c.maxScore
              : Math.round(c.maxScore * (0.5 + (hash % 5) / 10) * 100) / 100
            : null,
        evidence: c.evidenceRequired
          ? `Chưa xác minh: ${c.evidenceRequirement || "Supervisor đối chiếu với tài liệu gốc."}`
          : "Không yêu cầu evidence; kết quả vẫn chỉ là mô phỏng.",
        needsVerification: true,
        suggestions:
          c.aiEnabled && c.suggestSuggestions
            ? [`Gợi ý mô phỏng: kiểm tra và bổ sung nội dung cho “${c.name}”.`]
            : [],
      }
    })
  const findings = (run.ruleSnapshot.criteria ?? [])
    .filter((c) => c.enabled && c.aiEnabled && c.suggestFindings)
    .map((c) => ({
      id: `${run.id}-${c.id}`,
      level: c.critical ? "error" as const : "warning" as const,
      category: c.name,
      message: `Cần xác minh “${c.name}”. ${c.instruction || c.description} (Finding mô phỏng, chưa đọc file gốc.)`,
    }))
  return {
    ...run,
    evaluationStatus: "completed",
    criterionResults,
    maxScore: criterionResults.reduce((n, c) => n + c.maxScore, 0),
    overallScore:
      criterionResults.length && criterionResults.every((c) => c.score !== null)
        ? Math.round(
            criterionResults.reduce((n, c) => n + (c.score ?? 0), 0) * 100,
          ) / 100
        : null,
    findings,
  }
}
