import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Sắc thái ngữ nghĩa — ánh xạ sang token màu dự án.
enum Tone { neutral, olive, amber, rust, danger, brand }

class ToneColors {
  ToneColors._();

  static Color fg(Tone t) => switch (t) {
    Tone.neutral => AppColors.muted,
    Tone.olive => AppColors.olive,
    Tone.amber => AppColors.amber,
    Tone.rust => AppColors.rust,
    Tone.danger => AppColors.danger,
    Tone.brand => AppColors.brand,
  };

  static Color bg(Tone t) => switch (t) {
    Tone.neutral => AppColors.subtle,
    Tone.olive => AppColors.oliveSoft,
    Tone.amber => AppColors.amberSoft,
    Tone.rust => AppColors.rustSoft,
    Tone.danger => AppColors.dangerSoft,
    Tone.brand => AppColors.brandSoft,
  };
}

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
