// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';
import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';
import '../../../shared/widgets/dialog_actions.dart';

/// Lời gọi lại khi người dùng đã XÁC NHẬN xong một quyết định.
///
/// Page (tầng điều phối) sẽ tự ghi vào tầng dữ liệu rồi báo cho người dùng —
/// nút chỉ báo "người dùng chốt rồi", không tự ghi dữ liệu.
typedef DecisionCallback = void Function(
  String id,
  DocStatus next,
  String label,
  String okMessage,
);

/// Thanh quyết định cố định dưới màn S04.
///
/// ĐO THẬT (14/10) — chuyện này tốn nhiều lượt vì đo sai công cụ, ghi lại:
/// hai nút render đúng **40 CSS px**, dưới ngưỡng 48 của C4. Bằng chứng cuối
/// là đếm pixel màu brand trên ảnh chụp (`#146B55`, 80 device px ở scale 2
/// = 40 CSS px), khớp với node semantics `width:184px; height:40px` và với
/// vùng kích hoạt quét được (bấm dưới mép nút không mở hộp thoại).
///
/// Đã thử và ĐỀU KHÔNG ĂN:
///   1. `outlinedButtonTheme/filledButtonTheme.minimumSize = 48` (khai từ trước)
///   2. `SizedBox(height: 48)` bọc ngoài `Row`
///   3. `SizedBox(height: 96)` bọc ngoài `Row`
///   4. `styleFrom(minimumSize: Size.fromHeight(48))` ngay trên nút
/// Nguyên nhân: chiều cao từ cha truyền xuống là ràng buộc **tight**, nên
/// `minimumSize` bị vô hiệu. Cách ăn là **SizedBox bọc TRỰC TIẾP quanh
/// từng nút** — xem 2 chỗ `SizedBox(height: AppSpace.tapMin)` dưới đây.
class WorkspaceDecisionBar extends StatelessWidget {
  const WorkspaceDecisionBar({
    super.key,
    required this.review,
    required this.onDecide,
  });

  final ReviewRequest review;

  /// Nhận `(mã tài liệu, trạng thái kế tiếp, nhãn hành động, thông báo khi thành công)`.
  final DecisionCallback onDecide;

  @override
  Widget build(BuildContext context) {
    final r = review;
    return Container(
      padding: const EdgeInsets.all(AppSpace.l),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.line)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: SizedBox(
                height: AppSpace.tapMin,
                child: OutlinedButton(
                  onPressed: () => _confirm(
                    context,
                    title: 'Yêu cầu chỉnh sửa?',
                    message:
                        'Sinh viên sẽ nhận được yêu cầu chỉnh sửa và phải tạo '
                        'phiên bản mới. Hành động này không thu hồi được.',
                    confirmLabel: 'Gửi yêu cầu chỉnh sửa',
                    destructive: true,
                    onDone: () => onDecide(
                      r.id,
                      DocStatus.needsRevision,
                      'Yêu cầu chỉnh sửa',
                      'Đã gửi yêu cầu chỉnh sửa.',
                    ),
                  ),
                  child: const Text('Cần chỉnh sửa'),
                ),
              ),
            ),
            const SizedBox(width: AppSpace.m),
            Expanded(
              child: SizedBox(
                height: AppSpace.tapMin,
                child: FilledButton(
                  onPressed: () => _confirm(
                    context,
                    title: 'Phê duyệt tài liệu?',
                    message:
                        'Tài liệu ${r.documentTitle} ${r.version} sẽ được đánh dấu '
                        'đã phê duyệt và sinh viên có thể làm bước tiếp theo.',
                    confirmLabel: 'Phê duyệt',
                    destructive: false,
                    onDone: () => onDecide(
                      r.id,
                      DocStatus.approved,
                      'Phê duyệt',
                      'Đã phê duyệt tài liệu.',
                    ),
                  ),
                  child: const Text('Phê duyệt'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Hộp thoại xác nhận TRƯỚC khi ghi một quyết định không thu hồi được.
Future<void> _confirm(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  required bool destructive,
  required VoidCallback onDone,
}) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: AppRadius.dialogAll),
      title: Text(title, style: AppText.blockTitle),
      content: Text(message, style: AppText.body),
      // Dùng `DialogAction`: nút trong `AlertDialog.actions` bị ràng buộc
      // tight 40dp nên `minimumSize` của theme bị vô hiệu — đã đo được
      // 40dp trước khi sửa. `style` chỉ để đổi màu, không đặt minimumSize.
      actions: [
        DialogAction.cancel(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Huỷ'),
        ),
        DialogAction.confirm(
          style: destructive
              ? FilledButton.styleFrom(backgroundColor: AppColors.rust)
              : null,
          onPressed: () => Navigator.of(ctx).pop(true),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  if (ok == true) onDone();
}
