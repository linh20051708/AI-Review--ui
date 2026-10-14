// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';

/// S04 — Trạng thái dùng chung của màn "Không gian review" (`1-UC-06`, US04).
///
/// Sau khi tách màn theo `page -> state -> widget`, trang (`page/`) giữ phần
/// điều phối, còn các widget con cần biết "giảng viên vừa quyết định gì" để
/// đổi chip trạng thái ngay trên thẻ tài liệu. Truyền qua constructor từng lớp
/// sẽ ràng buộc mọi widget con vào chữ ký của trang; `InheritedWidget` giữ
/// đúng một nguồn cho trạng thái đó.
///
/// Tham chiếu: https://docs.flutter.dev/resources/architectural-overview
class WorkspaceState extends InheritedWidget {
  const WorkspaceState({
    super.key,
    required this.decided,
    required this.review,
    required super.child,
  });

  /// Quyết định vừa đưa ra trên màn này (chưa quyết định thì `null`).
  final DocStatus? decided;

  /// Tài liệu đang mở — luôn là bản mới nhất sau khi `ReviewRepository.write`.
  final ReviewRequest review;

  static WorkspaceState? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<WorkspaceState>();

  static WorkspaceState of(BuildContext context) {
    final state = maybeOf(context);
    assert(state != null, 'WorkspaceState.of() goi ben ngoai WorkspaceState');
    return state!;
  }

  @override
  bool updateShouldNotify(WorkspaceState old) => old.decided != decided;
}
