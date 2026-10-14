import 'package:meta/meta.dart';

/// Sắc thái ngữ nghĩa — CHỈ là nhãn trừu tượng, KHÔNG biết màu cụ thể.
///
/// Việc ánh xạ `Tone` -> `Color` nằm ở tầng 011 (`011_CORE_tone_colors.dart`),
/// vì tầng domain (101) không được phụ thuộc vào tầng Core UI (001).
/// Đây là luật cô lập tầng — mục 07 [CRITICAL] của docs/CMPlan.md.
enum Tone { neutral, olive, amber, rust, danger, brand }

/// Trạng thái tài liệu — nhãn tiếng Việt lấy nguyên từ `app/src/data/mockData.ts`.
enum DocStatus {
  draft('Bản nháp', Tone.neutral),
  submitted('Đã nộp', Tone.olive),
  reviewRequested('Đã gửi yêu cầu review', Tone.olive),
  aiReviewing('AI đang review', Tone.olive),
  aiReviewed('AI đã review', Tone.olive),
  waiting('Chờ giảng viên review', Tone.amber),
  inReview('Đang review', Tone.brand),
  needsRevision('Cần chỉnh sửa', Tone.rust),
  resubmitted('Đã nộp lại', Tone.olive),
  approved('Đã phê duyệt', Tone.brand),
  notAccepted('Không đạt', Tone.danger);

  const DocStatus(this.label, this.tone);

  final String label;
  final Tone tone;
}

/// Mức độ phát hiện của AI.
enum FindingLevel {
  error('Lỗi', Tone.rust),
  warning('Cảnh báo', Tone.amber),
  suggestion('Gợi ý', Tone.olive);

  const FindingLevel(this.label, this.tone);

  final String label;
  final Tone tone;
}

/// Yêu cầu review — ánh xạ `ReviewRequest` trong code nền.
@immutable
class ReviewRequest {
  const ReviewRequest({
    required this.id,
    required this.classCode,
    required this.groupName,
    required this.projectName,
    required this.documentTitle,
    required this.version,
    required this.submitter,
    required this.submittedAt,
    required this.aiErrors,
    required this.aiWarnings,
    required this.aiSuggestions,
    required this.status,
    this.note,
  });

  final String id;
  final String classCode;
  final String groupName;
  final String projectName;
  final String documentTitle;
  final String version;
  final String submitter;
  final String submittedAt;
  final int aiErrors;
  final int aiWarnings;
  final int aiSuggestions;
  final DocStatus status;
  final String? note;

  int get aiTotal => aiErrors + aiWarnings + aiSuggestions;

  /// Bản sao có đổi một vài trường.
  ///
  /// Cần cho `ReviewRepository.write()`: quyết định phê duyệt / yêu cầu chỉnh sửa
  /// phải **đổi được `status` thật**, nhưng entity là `@immutable` nên phải tạo
  /// bản mới thay vì sửa tại chỗ.
  ReviewRequest copyWith({DocStatus? status, String? note}) => ReviewRequest(
        id: id,
        classCode: classCode,
        groupName: groupName,
        projectName: projectName,
        documentTitle: documentTitle,
        version: version,
        submitter: submitter,
        submittedAt: submittedAt,
        aiErrors: aiErrors,
        aiWarnings: aiWarnings,
        aiSuggestions: aiSuggestions,
        status: status ?? this.status,
        note: note ?? this.note,
      );
}

/// Phát hiện của AI trên một tài liệu.
@immutable
class AiFinding {
  const AiFinding({
    required this.level,
    required this.category,
    required this.message,
    required this.pageRef,
  });

  final FindingLevel level;
  final String category;
  final String message;
  final String pageRef;
}

/// Một dòng trong bảng kiểm của AI.
@immutable
class AiCheck {
  const AiCheck({
    required this.title,
    required this.result,
    required this.tone,
    required this.detail,
  });

  final String title;
  final String result;
  final Tone tone;
  final String detail;
}

/// Việc cần chú ý trên màn Tổng quan.
@immutable
class AttentionItem {
  const AttentionItem({
    required this.title,
    required this.meta,
    required this.tone,
    required this.reviewId,
  });

  final String title;
  final String meta;
  final Tone tone;
  final String reviewId;
}

/// Một phiên bản tài liệu — dùng cho màn so sánh (`1-UC-09`, US08).
@immutable
class DocVersion {
  const DocVersion({
    required this.label,
    required this.fileName,
    required this.at,
    required this.author,
    required this.note,
  });

  final String label;
  final String fileName;
  final String at;
  final String author;
  final String note;
}

/// Sức khoẻ một nhóm — US12 (`1-UC-13`). `overdue` là số việc quá hạn.
@immutable
class GroupHealth {
  const GroupHealth({
    required this.groupName,
    required this.projectName,
    required this.classCode,
    required this.memberCount,
    required this.doneCount,
    required this.totalCount,
    required this.overdue,
  });

  final String groupName;
  final String projectName;
  final String classCode;
  final int memberCount;
  final int doneCount;
  final int totalCount;

  /// Số hạng mục quá hạn — chỉ báo đỏ khi > 0.
  final int overdue;

  double get progress => totalCount == 0 ? 0 : doneCount / totalCount;

  /// Suy ra sắc thái để tô màu, KHÔNG lưu màu trong domain (luật cô lập tầng).
  Tone get tone {
    if (overdue > 0) return Tone.danger;
    if (progress >= 1) return Tone.brand;
    if (progress >= 0.5) return Tone.olive;
    return Tone.amber;
  }
}

/// Chuẩn đang áp tại chỗ ra quyết định — US13 (`1-UC-14`).
@immutable
class ActiveRuleSet {
  const ActiveRuleSet({
    required this.name,
    required this.version,
    required this.appliesTo,
    required this.deadline,
    required this.checks,
  });

  final String name;
  final String version;
  final String appliesTo;
  final String deadline;
  final List<String> checks;
}

/// Một mục trong danh sách kiểm trước khi nộp — US10 (`1-UC-11`).
///
/// `blocking = true` nghĩa là mục này chưa xong **và** đang chặn nút nộp.
/// Nhãn `reason` phải nói rõ *vì sao*, không được để nút khoá im lặng (PN-08).
@immutable
class SubmitChecklistItem {
  const SubmitChecklistItem({
    required this.label,
    required this.done,
    required this.blocking,
    required this.reason,
  });

  final String label;
  final bool done;
  final bool blocking;
  final String reason;
}
