// CMPlan: tầng 201 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import '../../domain/entities/review_entities.dart';

/// Dữ liệu mẫu — chép nguyên giá trị từ `app/src/data/mockData.ts` của code nền.
/// Không tự bịa tên người, tên lớp hay số liệu mới.
class DemoData {
  DemoData._();

  static const currentUserName = 'Nguyễn Văn An';
  static const currentUserInitials = 'NA';
  static const currentUserRole = 'Giảng viên / Supervisor';
  static const currentUserEmail = 'an.nguyen@university.edu.vn';
  static const currentSemester = 'Fall 2026';

  static const reviewRequests = <ReviewRequest>[
    ReviewRequest(
      id: 'review-001',
      classCode: 'SE1701',
      groupName: 'Group 04',
      projectName: 'Smart Attendance System',
      documentTitle: 'Use Case Diagram',
      version: 'v2',
      submitter: 'Nguyễn Minh Anh',
      submittedAt: '03/10/2026 · 08:15',
      aiErrors: 2,
      aiWarnings: 3,
      aiSuggestions: 2,
      status: DocStatus.waiting,
      note: 'Nộp lại sau feedback v1 · 1 feedback cũ cần kiểm tra',
    ),
    ReviewRequest(
      id: 'review-008',
      classCode: 'SE1701',
      groupName: 'Group 01',
      projectName: 'Smart Campus Management',
      documentTitle: 'Sequence Diagram',
      version: 'v2',
      submitter: 'Trần Hoàng Nam',
      submittedAt: '03/10/2026 · 07:40',
      aiErrors: 2,
      aiWarnings: 3,
      aiSuggestions: 1,
      status: DocStatus.waiting,
      note: 'Nộp lại sau feedback v1 · sửa thứ tự message',
    ),
    ReviewRequest(
      id: 'review-005',
      classCode: 'SE1701',
      groupName: 'Group 05',
      projectName: 'Dormitory Management Platform',
      documentTitle: 'Activity Diagram',
      version: 'v1',
      submitter: 'Hoàng Thu Trang',
      submittedAt: '02/10/2026 · 08:55',
      aiErrors: 0,
      aiWarnings: 1,
      aiSuggestions: 2,
      status: DocStatus.waiting,
    ),
    ReviewRequest(
      id: 'review-004',
      classCode: 'SE1701',
      groupName: 'Group 08',
      projectName: 'Campus Service Portal',
      documentTitle: 'Sequence Diagram',
      version: 'v2',
      submitter: 'Võ Quốc Bảo',
      submittedAt: '29/09/2026 · 16:30',
      aiErrors: 1,
      aiWarnings: 1,
      aiSuggestions: 0,
      status: DocStatus.waiting,
      note: 'Chờ giảng viên hơn 72 giờ',
    ),
    ReviewRequest(
      id: 'review-002',
      classCode: 'SE1701',
      groupName: 'Group 02',
      projectName: 'Hospital Management System',
      documentTitle: 'Sequence Diagram',
      version: 'v3',
      submitter: 'Đỗ Khánh Linh',
      submittedAt: '03/10/2026 · 07:05',
      aiErrors: 0,
      aiWarnings: 2,
      aiSuggestions: 1,
      status: DocStatus.inReview,
      note: 'Bạn đã bắt đầu review lúc 09:40',
    ),
    ReviewRequest(
      id: 'review-009',
      classCode: 'SE1701',
      groupName: 'Group 03',
      projectName: 'Student Services Portal',
      documentTitle: 'Activity Diagram',
      version: 'v2',
      submitter: 'Phạm Thảo My',
      submittedAt: '01/10/2026 · 10:00',
      aiErrors: 1,
      aiWarnings: 2,
      aiSuggestions: 0,
      status: DocStatus.needsRevision,
      note: 'Đã yêu cầu chỉnh sửa lần 2 · chờ sinh viên tạo version mới',
    ),
    ReviewRequest(
      id: 'review-003',
      classCode: 'SE1701',
      groupName: 'Group 01',
      projectName: 'Smart Campus Management',
      documentTitle: 'Use Case Diagram',
      version: 'v3',
      submitter: 'Nguyễn Minh Anh',
      submittedAt: '14/09/2026 · 10:32',
      aiErrors: 0,
      aiWarnings: 0,
      aiSuggestions: 1,
      status: DocStatus.approved,
    ),
    ReviewRequest(
      id: 'review-010',
      classCode: 'SE1701',
      groupName: 'Group 07',
      projectName: 'Event Management System',
      documentTitle: 'Activity Diagram',
      version: 'v1',
      submitter: 'Đặng Hải Yến',
      submittedAt: '28/09/2026 · 21:10',
      aiErrors: 0,
      aiWarnings: 0,
      aiSuggestions: 0,
      status: DocStatus.notAccepted,
      note: 'Không đạt · Sai loại tài liệu (nộp nhầm biên bản họp)',
    ),
  ];

  static const attentionItems = <AttentionItem>[
    AttentionItem(
      title: 'Group 08 · Campus Service Portal',
      meta: 'Chờ giảng viên hơn 72 giờ · Sequence Diagram v2',
      tone: Tone.danger,
      reviewId: 'review-004',
    ),
    AttentionItem(
      title: 'Group 04 · Smart Attendance System',
      meta: 'Nộp lại sau feedback v1 · cần kiểm tra 1 feedback cũ',
      tone: Tone.amber,
      reviewId: 'review-001',
    ),
    AttentionItem(
      title: 'Group 03 · Student Services Portal',
      meta: 'Đã yêu cầu chỉnh sửa lần 2 · chờ sinh viên tạo version mới',
      tone: Tone.rust,
      reviewId: 'review-009',
    ),
    AttentionItem(
      title: 'Group 01 · Smart Campus Management',
      meta: 'Sequence Diagram v2 · AI đã review, chờ bạn duyệt',
      tone: Tone.brand,
      reviewId: 'review-008',
    ),
  ];

  static const aiFindings = <AiFinding>[
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.error,
      category: 'Incorrect Relationship',
      message:
          'Use Case Submit Document chưa có relationship phù hợp với Actor Student.',
      pageRef: 'Trang 8',
    ),
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.error,
      category: 'Missing Element',
      message: 'Use Case Login chưa được liên kết với Actor nào.',
      pageRef: 'Trang 7',
    ),
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.warning,
      category: 'Naming Issue',
      message: 'Use Case Manage Project có phạm vi quá rộng.',
      pageRef: 'Trang 8',
    ),
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.warning,
      category: 'Requirement Mismatch',
      message: 'FR-05 (Request Review) chưa được thể hiện bằng Use Case tương ứng.',
      pageRef: 'Mục 2.3',
    ),
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.warning,
      category: 'UML Violation',
      message:
          'Quan hệ Include giữa Upload Document và Request Review đang ngược chiều.',
      pageRef: 'Trang 9',
    ),
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.suggestion,
      category: 'Logic Issue',
      message:
          'Cân nhắc tách Manage Project thành Create Project, Update Project và Archive Project.',
      pageRef: 'Trang 8',
    ),
    AiFinding(
      reviewId: 'review-001',
      level: FindingLevel.suggestion,
      category: 'Naming Issue',
      message: 'Dùng động từ thống nhất cho tên Use Case (Submit / Upload).',
      pageRef: 'Mục 3.1',
    ),
  ];

  static const aiChecks = <AiCheck>[
    AiCheck(
      title: 'Định dạng file',
      result: 'Hợp lệ',
      tone: Tone.brand,
      detail: 'File đọc được, 12 trang, không bị khóa mật khẩu.',
    ),
    AiCheck(
      title: 'Cấu trúc tài liệu',
      result: 'Hợp lệ',
      tone: Tone.brand,
      detail: 'Có đủ mục Giới thiệu, Actor, Use Case, Mô tả chi tiết.',
    ),
    AiCheck(
      title: 'Relationship',
      result: '2 lỗi',
      tone: Tone.rust,
      detail: 'Submit Document và Login thiếu Association phù hợp.',
    ),
    AiCheck(
      title: 'Tính nhất quán tên',
      result: '2 cảnh báo',
      tone: Tone.amber,
      detail: 'Manage Project có phạm vi quá rộng.',
    ),
    AiCheck(
      title: 'Đối chiếu requirement',
      result: '1 cảnh báo',
      tone: Tone.amber,
      detail: 'FR-05 chưa có Use Case tương ứng.',
    ),
  ];

  /// Bản ghi version của review-001 (lấy từ `documentVersions` trong code nền).
  static const versionLog = <({String version, String fileName, String at, String status})>[
    (
      version: 'v1',
      fileName: 'use-case-diagram-v1.pdf',
      at: '30/09/2026 · 10:05',
      status: 'Cần chỉnh sửa',
    ),
    (
      version: 'v2',
      fileName: 'use-case-diagram-v2.pdf',
      at: '03/10/2026 · 08:15',
      status: 'Chờ giảng viên review',
    ),
  ];

  static ReviewRequest byId(String id) =>
      reviewRequests.firstWhere((r) => r.id == id, orElse: () => reviewRequests.first);

  /// Phiên bản tài liệu — dùng cho màn so sánh (`1-UC-09`, US08).
  /// Mốc thời gian và người nộp lấy từ `updatedAt` / `submitter` trong `mockData.ts`.
  static const docVersions = <DocVersion>[
    DocVersion(
      label: 'v1',
      fileName: 'sequence-diagram-v1.pdf',
      at: '28/09/2026',
      author: 'Trần Hoàng Nam',
      note: 'Bản đầu — chưa có thứ tự message cho luồng phụ.',
    ),
    DocVersion(
      label: 'v2',
      fileName: 'sequence-diagram-v2.pdf',
      at: '03/10/2026',
      author: 'Trần Hoàng Nam',
      note: 'Nộp lại sau feedback v1: sửa thứ tự message.',
    ),
  ];

  /// Sức khoẻ nhóm — suy từ `studentGroups` trong `mockData.ts`
  /// (`group(classId, n, projectId, health, progress, pendingReviews, lastActivity)`).
  static const groupHealth = <GroupHealth>[
    GroupHealth(
      groupName: 'Group 01 · SE1701',
      projectName: 'Smart Campus Management',
      classCode: 'SE1701',
      memberCount: 7,
      doneCount: 4,
      totalCount: 4,
      overdue: 0,
    ),
    GroupHealth(
      groupName: 'Group 02 · SE1701',
      projectName: 'Event Management System',
      classCode: 'SE1701',
      memberCount: 6,
      doneCount: 1,
      totalCount: 4,
      overdue: 2,
    ),
    GroupHealth(
      groupName: 'Group 03 · SE1702',
      projectName: 'Library Management',
      classCode: 'SE1702',
      memberCount: 5,
      doneCount: 2,
      totalCount: 4,
      overdue: 0,
    ),
  ];

  /// Chuẩn đang áp — chép từ `ruleSets` trong `mockData.ts`.
  static const activeRuleSets = <ActiveRuleSet>[
    ActiveRuleSet(
      name: 'SWP Standard Review 2026',
      version: 'swp-standard-2026',
      appliesTo: 'Software Project · Project-based Learning',
      deadline: '15/12/2026 23:59',
      checks: [
        'AI review chạy tự động',
        'Bắt buộc giảng viên phê duyệt',
        'Tài liệu phụ thuộc phải được duyệt trước',
        'Định dạng cho phép: PDF, DOCX',
        'Kích thước tối đa: 20 MB',
        'SLA review: 3 ngày · Tối đa 5 lần nộp lại',
      ],
    ),
    ActiveRuleSet(
      name: 'SWR Requirements Review 2026',
      version: 'swr-requirements-2026',
      appliesTo: 'Software Requirements · SRS và Use Case Diagram',
      deadline: '10/11/2026 23:59',
      checks: [
        'AI review BẮT BUỘC trước khi giảng viên duyệt',
        'Bắt buộc giảng viên phê duyệt',
        'Tài liệu phụ thuộc phải được duyệt trước',
      ],
    ),
  ];

  /// Danh sách kiểm trước khi nộp — suy từ `dependsOn` trong `mockData.ts`:
  /// State Diagram phụ thuộc Sequence Diagram (chưa được duyệt) nên đang chặn nộp.
  /// Mục `blocking = false` để chứng minh KHÔNG phải mọi mục thiếu đều chặn.
  static const submitChecklist = <SubmitChecklistItem>[
    SubmitChecklistItem(
      label: 'Use Case Diagram',
      done: true,
      blocking: false,
      reason: 'Đã phê duyệt',
    ),
    SubmitChecklistItem(
      label: 'Activity Diagram',
      done: true,
      blocking: false,
      reason: 'Đã phê duyệt',
    ),
    SubmitChecklistItem(
      label: 'Sequence Diagram',
      done: false,
      blocking: true,
      reason: 'Đang chờ giảng viên review — phải duyệt xong mới nộp được',
    ),
    SubmitChecklistItem(
      label: 'Đúng định dạng (PDF, DOCX)',
      done: true,
      blocking: false,
      reason: 'Đạt',
    ),
    SubmitChecklistItem(
      label: 'Nhóm đã đủ thành viên',
      done: false,
      blocking: false,
      reason: 'Còn thiếu nhưng KHÔNG chặn nộp',
    ),
  ];
}
