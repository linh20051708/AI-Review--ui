import type { RubricCriterion } from "@/types"

export type SampleKind = "srs" | "sds" | "design" | "persona" | "diagram" | "other"
export interface SampleCheck {
  key: string; name: string; match: RegExp; text: string; comment: string
  issue?: string; suggestion: string; ratio: number
}
export interface DocumentSample { kind: SampleKind; title: string; checks: SampleCheck[] }
const check = (key: string, name: string, match: RegExp, text: string, comment: string, issue: string | undefined, suggestion: string, ratio = .7): SampleCheck => ({ key, name, match, text, comment, issue, suggestion, ratio: issue ? ratio : 1 })
const scope = check("scope", "Phạm vi hệ thống", /phạm vi|mục tiêu project|ranh giới/i,
  "Phạm vi: Student nộp tài liệu theo Lab; Supervisor review, gửi feedback và ra quyết định. Thanh toán và quản lý học phí nằm ngoài phạm vi.",
  "Đã phân biệt tác vụ nộp bài và review với các chức năng ngoài phạm vi.", undefined, "Giữ ranh giới này khi bổ sung yêu cầu.")
const srs = [scope,
  check("functional", "Yêu cầu chức năng", /yêu cầu chức năng|functional requirement|thành phần bắt buộc/i,
    "FR-01: Student chọn PDF/DOCX tối đa 20 MB. FR-02: Student xác nhận nộp để tạo phiên bản và gửi yêu cầu review. FR-03: Supervisor ghi feedback và quyết định. UC-01 Submit Document: chọn file → xác nhận → gửi review. Ngoại lệ: chưa mô tả.",
    "FR-01–03 có mã và hành vi; UC-01 mới có luồng thành công.", "UC-01 chưa xử lý file sai định dạng hoặc gửi trùng.", "Thêm luồng E1 từ chối file sai định dạng và E2 bỏ qua thao tác gửi trùng."),
  check("nfr", "Yêu cầu phi chức năng", /phi chức năng|non.functional|ngưỡng đo/i,
    "NFR-01: Hệ thống phản hồi nhanh khi nộp tài liệu. NFR-02: Chỉ thành viên nhóm được nộp tài liệu cho project của nhóm.",
    "NFR-02 có điều kiện quyền rõ; NFR-01 chưa đo được.", "Từ “nhanh” chưa có ngưỡng và tải thử nghiệm.", "Đặt mục tiêu p95 dưới 2 giây với 100 người dùng đồng thời, rồi xác nhận bằng kiểm thử.", .5),
  check("trace", "Truy vết yêu cầu", /truy vết|kịch bản|nghiệm thu/i,
    "Truy vết: FR-01 → UC-01; FR-02 → UC-01; FR-03 → UC-02 Review Document. Tiêu chí nghiệm thu: chưa gắn mã kiểm thử.",
    "Đã nối FR với Use Case; chưa nối tới kiểm thử nghiệm thu.", "FR-02 chưa có test case xác nhận chỉ tạo một phiên bản.", "Bổ sung AC-02 và TC-02: nhấn gửi hai lần chỉ tạo một version."),
  check("terms", "Thuật ngữ & ràng buộc", /thuật ngữ|ràng buộc|nhất quán|giả định|giới hạn/i,
    "Thuật ngữ: Student = thành viên nhóm; Supervisor = giảng viên phụ trách. Phiên bản đã nộp không được sửa. Điểm AI là tham khảo, quyết định do Supervisor ghi nhận.",
    "Vai trò và tính bất biến của phiên bản được mô tả nhất quán.", undefined, "Duy trì các thuật ngữ này trong Use Case và màn hình nộp bài.")
]
const sds = [scope,
  check("architecture", "Kiến trúc & module", /kiến trúc|module|thành phần bắt buộc/i,
    "Kiến trúc: Web UI → Review Service → Database. Các module: Submission quản lý bản nộp; Review quản lý feedback/quyết định; AI Adapter cung cấp điểm tham khảo. Review Service truy cập Database trực tiếp; chưa chỉ rõ ranh giới transaction.",
    "Các module đã có trách nhiệm; thao tác nộp bài cần ranh giới transaction.", "Chưa mô tả cách rollback nếu lưu phiên bản thành công nhưng tạo review thất bại.", "Đặt tạo Version và ReviewRequest trong cùng transaction; mô tả rollback.", .6),
  check("database", "Thiết kế database", /database|cơ sở dữ liệu|dữ liệu/i,
    "Schema: Project(id); Document(id, projectId); DocumentVersion(id, documentId, versionNo, fileName); ReviewRequest(id, versionId, status). Khóa ngoại liên kết các bảng. Chưa khai báo unique(documentId, versionNo).",
    "Có quan hệ Document–Version–ReviewRequest; thiếu ràng buộc duy nhất.", "Có thể tồn tại hai bản ghi cùng documentId và versionNo.", "Thêm unique(documentId, versionNo) và xử lý xung đột khi nộp đồng thời.", .5),
  check("api", "Hợp đồng API", /api|giao tiếp|interface|truy vết|kịch bản/i,
    "POST /documents/{id}/submissions nhận fileRef và note; trả 201 {versionId, reviewId}. GET /reviews/{id} trả trạng thái và feedback. Chưa định nghĩa response lỗi hoặc idempotency key.",
    "API có đầu vào và response thành công; thiếu hợp đồng lỗi.", "Client chưa biết xử lý lần gửi lặp hoặc dependency chưa đạt.", "Bổ sung 409 cho gửi trùng, 422 cho dependency và trường code/message."),
  check("security", "Quyền truy cập", /quyền|bảo mật|thuật ngữ|giả định|giới hạn/i,
    "Submission kiểm tra thành viên nhóm và dependency trước khi ghi. Review chỉ cho Supervisor được phân công ghi quyết định. AI Adapter không ghi trạng thái phê duyệt.",
    "Quyền nộp và quyết định review được phân tách.", undefined, "Giữ kiểm tra quyền tại service, bên cạnh kiểm tra trên UI.")
]
const design = [scope,
  check("class", "Class diagram", /class|lớp|thành phần bắt buộc/i,
    "Class model: Document 1—* DocumentVersion; DocumentVersion 1—1 ReviewRequest. SubmissionService.submit() gọi VersionRepository.save() và ReviewRepository.create(). Chưa ghi kiểu trả về và lỗi của submit().",
    "Quan hệ class đã có bội số; chữ ký submit chưa đầy đủ.", "Caller chưa biết submit trả về gì khi dependency chưa đạt.", "Thêm SubmissionResult và DependencyNotMet cho chữ ký submit()."),
  check("sequence", "Sequence diagram", /sequence|luồng|truy vết|kịch bản/i,
    "Sequence: Student → SubmissionController.submit → SubmissionService.checkPermission → VersionRepository.save → ReviewRepository.create → trả versionId. Chưa có nhánh alt lưu thất bại hoặc gửi trùng.",
    "Luồng chính thể hiện đúng thứ tự kiểm tra quyền trước khi lưu.", "Chưa có nhánh alt cho lỗi ghi dữ liệu.", "Thêm alt transaction failed → rollback → trả lỗi, và nhánh duplicate submission.", .5),
  check("component", "Component design", /component|module|thiết kế|nhất quán/i,
    "Components: UploadForm nhận onSubmit(file, note); ReviewPanel nhận reviewId; DecisionBar nhận onDecision. UploadForm chưa có props busy/error hoặc callback retry.",
    "Component đã tách theo tác vụ; UploadForm thiếu hợp đồng trạng thái lỗi.", "Chưa thể hiện cách khóa gửi lặp và thử lại ở component.", "Thêm busy, error, onRetry và disabled khi đang gửi."),
  check("constraints", "Ràng buộc thiết kế", /giả định|giới hạn|ràng buộc|quyền/i,
    "DocumentVersion là bất biến sau khi nộp. Chỉ Supervisor được phân công gọi DecisionService. Kết quả AI không gọi DecisionService.",
    "Thiết kế bảo toàn phiên bản và quyền quyết định.", undefined, "Giữ các ràng buộc này trong unit test của service.")
]
const persona = [
  check("scope", "Phạm vi & người dùng", /phạm vi|tác vụ trọng tâm/i,
    "Người dùng: Student nộp bài theo Lab và Supervisor review nhiều nhóm. Mục tiêu sản phẩm: giúp Student sửa đúng yêu cầu và giúp Supervisor ưu tiên bài cần review.",
    "Tác vụ và hai vai trò chính được xác định.", undefined, "Giữ trọng tâm nộp bài và phản hồi khi phát triển luồng."),
  check("stakeholder", "Bản đồ người dùng", /stakeholder|map|bỏ sót/i,
    "Stakeholder Map: Student, Group Leader và Supervisor. Chưa đề cập Student dùng trình đọc màn hình hoặc kết nối yếu.",
    "Có vai trò nhóm; chưa cân nhắc người dùng dễ bị bỏ sót.", "Chưa có nhu cầu của Student dùng công nghệ hỗ trợ.", "Bổ sung nhánh accessibility và bối cảnh mạng yếu vào User Map."),
  check("number", "Số lượng Persona", /số persona|chỉ có 1|số lượng/i,
    "Hai Persona: Minh Anh — Student làm bài bằng điện thoại; Thầy An — Supervisor review nhiều nhóm trên laptop. Phân nhóm dựa trên vai trò và bối cảnh sử dụng.",
    "Hai Persona khác vai trò và bối cảnh, có lý do phân nhóm.", undefined, "Giữ số lượng này đến khi nghiên cứu phát hiện nhóm hành vi khác."),
  check("difference", "Khác biệt Persona", /phân biệt|khác biệt|behaviors/i,
    "Minh Anh làm bài trên điện thoại vào buổi tối, thường kiểm tra deadline trước khi nộp. Thầy An xử lý hàng đợi theo lớp và mức độ cần sửa vào cuối tuần.",
    "Bối cảnh và hành vi khác nhau, không chỉ khác thông tin nhân khẩu học.", undefined, "Dùng hai bối cảnh này để đánh giá màn hình Upload và Review Queue."),
  check("fields", "Goals & pain points", /12 trường|cốt lõi|thông tin persona/i,
    "Minh Anh: goal nộp đúng phiên bản; pain point không biết lỗi nào cần sửa trước; công cụ điện thoại; constraint mạng yếu. Thầy An: goal phản hồi đúng trọng tâm; pain point nội dung lặp; công cụ laptop. Hồ sơ chưa ghi tần suất tác vụ và tiêu chí thành công riêng cho từng Persona.",
    "Có goals và pain points; hồ sơ chưa đủ trường hành vi.", "Thiếu tần suất thực hiện và success criteria của từng Persona.", "Thêm tần suất nộp/review và cách xác định tác vụ hoàn thành."),
  check("jtbd", "Nhu cầu & JTBD", /nhu cầu|kết quả mong muốn|jtbd/i,
    "JTBD của Minh Anh: Khi nhận yêu cầu chỉnh sửa, tôi muốn biết phần cần sửa trước để nộp lại đúng hạn. JTBD của Thầy An: Khi mở hàng đợi, tôi muốn nhận biết bài cần chú ý để phân bổ thời gian review.",
    "Nhu cầu diễn đạt theo kết quả, chưa áp đặt giải pháp giao diện.", undefined, "Liên kết JTBD với tác vụ ưu tiên trên Dashboard."),
  check("evidence", "Evidence & giả định", /bằng chứng|giả định|nghiên cứu hoặc/i,
    "Evidence matrix: Nhận định “Student thường bỏ sót feedback” được gắn nhãn giả định. Chưa có mã phỏng vấn, trích dẫn hoặc quan sát hỗ trợ nhận định này.",
    "Đã gắn nhãn giả định; chưa có bằng chứng nghiên cứu hỗ trợ.", "Pain point bỏ sót feedback chưa được đối chiếu với quan sát.", "Thêm mã nguồn R01, trích dẫn và ngày ghi nhận sau khi thực hiện nghiên cứu.", .5),
  check("affinity", "Tổng hợp nghiên cứu", /affinity|pattern|phân khúc/i,
    "Tổng hợp: nhóm tác vụ Nộp bài, Theo dõi feedback và Review nhiều nhóm. Chưa có Affinity Board hoặc mapping từ ghi chú nghiên cứu tới các nhóm tác vụ.",
    "Có nhóm tác vụ nhưng chưa truy vết về dữ liệu nghiên cứu.", "Chưa thể xác định pattern nào dẫn tới hai Persona.", "Liên kết từng nhóm tác vụ với ghi chú R01/R02 khi có dữ liệu thực."),
  check("scenario", "Kịch bản & thành công", /scenario|success criteria|kịch bản/i,
    "Scenario: Minh Anh nhận feedback trước deadline 24 giờ, đọc lỗi quan trọng rồi nộp v2. Success criteria hiện ghi “hoàn thành nhanh”.",
    "Kịch bản có tác nhân và thời điểm; thành công chưa đo được.", "“Hoàn thành nhanh” chưa có ngưỡng đo.", "Đặt tiêu chí: tìm đúng yêu cầu chỉnh sửa trong 30 giây, rồi kiểm chứng với người dùng."),
  check("validation", "Quyết định & kiểm chứng", /quyết định|kiểm chứng|giả thuyết ui/i,
    "Giả thuyết UI: đưa feedback cần sửa lên đầu giúp Student tìm tác vụ nhanh hơn. Kế hoạch: quan sát Student tìm yêu cầu chỉnh sửa; chưa chỉ rõ chỉ số và số người tham gia.",
    "Có giả thuyết gắn Persona; kế hoạch kiểm chứng chưa cụ thể.", "Chưa quy định chỉ số thành công hoặc tiêu chí chọn người tham gia.", "Ghi task, thời gian tìm feedback, tiêu chí hoàn thành và kế hoạch tuyển người thử.")
]
const diagram = [scope,
  check("actors", "Actor & mục tiêu", /^actor|thành phần bắt buộc/i,
    "Actor Student liên kết với Login, Manage Project, Upload Document và Submit Document. Supervisor liên kết với Review Document.",
    "Student đã có Association với Login và Submit Document.", undefined, "Duy trì liên kết giữa Student và các tác vụ nộp bài."),
  check("goal", "Mục tiêu Use Case", /mục tiêu có giá trị|thuật ngữ|nhất quán/i,
    "Các Use Case: Login, Manage Project, Upload Document, Submit Document và Review Document. Manage Project chưa có đặc tả thao tác cụ thể.",
    "Các tác vụ nộp/review rõ; Manage Project còn quá rộng.", "Tên Manage Project gộp nhiều mục tiêu chưa được đặc tả.", "Tách Create Project và Update Project nếu cả hai nằm trong phạm vi."),
  check("uml", "Quan hệ & điều kiện", /association|include|extend|quan hệ|thông điệp/i,
    "Đặc tả Submit Document: tiền điều kiện đã đăng nhập và upload thành công; luồng chính chọn tài liệu → chọn version → gửi review; hậu điều kiện tạo ReviewRequest. Mục Include vẫn ghi Upload Document. Chưa có luồng thay thế.",
    "Upload vừa là tiền điều kiện vừa là Include, cần thống nhất cách mô hình hóa.", "Chưa rõ upload nằm trước hay nằm trong Submit Document.", "Nếu file đã upload trước, bỏ Include; nếu upload là bước bắt buộc trong Submit, đưa bước đó vào luồng chính.", .5),
  check("trace", "Truy vết & luồng lỗi", /truy vết|kịch bản|giả định|giới hạn/i,
    "FR-03: Student upload PDF/DOCX tối đa 20 MB. FR-05: chỉ gửi review khi dependency được duyệt. Use Case chưa mô tả nhánh dependency chưa đạt và lỗi upload.",
    "Có FR-03/FR-05; luồng lỗi chưa được nối với yêu cầu.", "Chưa có guard hoặc nhánh thay thế khi dependency chưa đạt.", "Thêm nhánh [dependency chưa đạt] và thông báo tài liệu phải hoàn thành trước.")
]
const sequence = [scope,
  check("messages", "Thông điệp & thành phần", /thành phần|actor|thông điệp/i,
    "Student → UploadForm: submit(file); UploadForm → SubmissionService: submit(file); SubmissionService → VersionRepository: save(); VersionRepository → SubmissionService: versionId. Chưa có thông điệp trả kết quả từ SubmissionService về UploadForm.",
    "Thông điệp gọi đã có thứ tự; thiếu đường trả kết quả cho UI.", "UploadForm chưa nhận versionId hoặc lỗi để kết thúc trạng thái đang nộp.", "Thêm response SubmissionResult(versionId, reviewId) và nhánh trả lỗi."),
  check("guard", "Điều kiện luồng", /nhất quán|quan hệ|điều kiện/i,
    "Sequence hiện chỉ có luồng thành công. Chưa có alt [dependency chưa đạt] hoặc [lưu thất bại].",
    "Luồng chính rõ nhưng chưa bao phủ điều kiện chặn nộp.", "Thiếu nhánh alt khi dependency chưa đạt.", "Thêm alt [dependency chưa đạt] trước save() và thông điệp lỗi về UploadForm.", .5),
  check("trace", "Truy vết yêu cầu", /truy vết|kịch bản/i,
    "FR-02 yêu cầu tạo DocumentVersion và ReviewRequest cùng lúc. Sequence mới có VersionRepository.save(), chưa có ReviewRepository.create().",
    "Luồng chưa thể hiện toàn bộ hậu điều kiện của FR-02.", "Chưa có bước tạo ReviewRequest sau khi lưu phiên bản.", "Thêm ReviewRepository.create(versionId) trong cùng transaction."),
  check("constraints", "Ràng buộc", /giả định|giới hạn|quyền/i,
    "Phiên bản đã nộp là bất biến; điểm AI không được chuyển thành quyết định phê duyệt.",
    "Tính bất biến và quyền quyết định đã được ghi rõ.", undefined, "Duy trì hai ràng buộc này trong thiết kế service.")
]
const activity = [scope,
  check("nodes", "Các bước xử lý", /thành phần|actor/i,
    "Activity: Bắt đầu → Chọn file → Kiểm tra định dạng → Lưu phiên bản → Gửi review → Kết thúc. Có nút bắt đầu và kết thúc.",
    "Có các bước chính và điểm kết thúc rõ.", undefined, "Giữ tên bước theo động từ để dễ quét."),
  check("guard", "Điều kiện rẽ nhánh", /nhất quán|quan hệ|điều kiện/i,
    "Sau Kiểm tra định dạng, nhánh hợp lệ đi tới Lưu phiên bản. Nhánh lỗi quay về Chọn file nhưng chưa có nhãn guard.",
    "Có đường quay lại khi lỗi; điều kiện trên nhánh chưa rõ.", "Thiếu guard [hợp lệ] và [không hợp lệ].", "Gắn nhãn guard cho cả hai nhánh của nút quyết định.", .5),
  check("dependency", "Luồng điều kiện nộp", /truy vết|kịch bản/i,
    "FR-05 yêu cầu dependency được duyệt trước khi nộp. Luồng hiện chưa có bước kiểm tra dependency trước Lưu phiên bản.",
    "Luồng chính chưa thể hiện ràng buộc FR-05.", "Thiếu bước kiểm tra dependency.", "Thêm Kiểm tra dependency và nhánh [chưa đạt] về màn hình tài liệu."),
  check("constraints", "Ràng buộc", /giả định|giới hạn|quyền/i,
    "Chỉ thành viên nhóm được nộp tài liệu; phiên bản đã gửi không sửa trực tiếp.",
    "Quyền nộp và tính bất biến đã được xác định.", undefined, "Giữ kiểm tra quyền trước khi ghi dữ liệu.")
]
export function sampleKind(title: string): SampleKind {
  if (/persona/i.test(title)) return "persona"
  if (/\bsrs\b|software requirements/i.test(title)) return "srs"
  if (/\bsds\b|system design/i.test(title)) return "sds"
  if (/detailed design|thiết kế chi tiết|class diagram/i.test(title)) return "design"
  if (/diagram|use case|sơ đồ/i.test(title)) return "diagram"
  return "other"
}
export function documentSample(title: string): DocumentSample {
  const kind = sampleKind(title)
  if (/sequence/i.test(title)) return { kind, title, checks: sequence }
  if (/activity/i.test(title)) return { kind, title, checks: activity }
  if (/state/i.test(title)) return { kind, title, checks: [scope,
    check("states", "Trạng thái tài liệu", /thành phần|actor/i,
      "Các trạng thái: Draft → Submitted → In Review → Approved. Tài liệu cần sửa chuyển từ In Review về Needs Revision.",
      "Có trạng thái nộp, review và yêu cầu sửa.", undefined, "Giữ tên trạng thái nhất quán với màn hình tài liệu."),
    check("guards", "Điều kiện chuyển trạng thái", /nhất quán|quan hệ|điều kiện/i,
      "Submitted chuyển sang In Review khi Supervisor mở bài. Needs Revision chuyển sang Submitted khi Student nộp lại; chưa ghi guard dependency được duyệt.",
      "Có sự kiện chuyển trạng thái; còn thiếu guard nộp lại.", "Chưa ghi điều kiện dependency trên chuyển trạng thái nộp lại.", "Bổ sung guard [dependency đã được duyệt] trước khi chuyển sang Submitted.", .5),
    check("trace", "Truy vết quyết định", /truy vết|kịch bản/i,
      "Approved chỉ do Supervisor quyết định. Nhánh In Review → Not Accepted chưa được mô tả.",
      "Đã xác định quyền phê duyệt; thiếu nhánh không đạt.", "Chưa thể hiện trạng thái Not Accepted.", "Thêm Not Accepted và sự kiện Supervisor từ chối."),
    check("constraint", "Ràng buộc", /giả định|giới hạn|quyền/i,
      "Điểm AI không kích hoạt chuyển trạng thái Approved.",
      "Quyết định chính thức được tách khỏi AI.", undefined, "Giữ quyền chuyển Approved ở Supervisor.")
  ] }
  return { kind, title, checks: ({ srs, sds, design, persona, diagram, other: [scope] })[kind] }
}
export function sampleCheckFor(c: RubricCriterion, sample: DocumentSample): SampleCheck | undefined {
  // Generic baseline criteria have stable semantics; do not assign random issues to custom criteria.
  if (/^REVIEW0[1-5]$/.test(c.id)) return sample.checks[Number(c.id.slice(-1)) - 1]
  return sample.checks.find(check => check.match.test(c.name))
}
