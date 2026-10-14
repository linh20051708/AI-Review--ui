// CMPlan: tầng 011 · REVIEW · US06 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../shared/theme/color_tokens.dart';
import '../../shared/theme/spacing.dart';
import '../../shared/theme/typography.dart';
import '../../data/repositories/review_repository.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_chip.dart';
import '../../shared/widgets/tone_colors.dart';
import '../../shared/widgets/offline_banner.dart';
import '../../domain/entities/review_entities.dart';
import '../../../shared/widgets/dialog_actions.dart';

/// S06 — Phê duyệt có xác nhận (`1-UC-07`, US06).
///
/// Quy tắc nghiệp vụ bắt buộc: **không** đổi trạng thái ngay khi bấm.
/// Phải qua hộp thoại xác nhận (tránh bấm nhầm). Huỷ thì không phát sinh gì.
///
/// Yêu cầu "ít bấm nhất": từ màn này tới lúc xong chỉ 2 bấm — mở xác nhận,
/// xác nhận. Đo bằng `verify/flutter-journeys.mjs`.
class ApprovalDecisionScreen extends StatefulWidget {
  const ApprovalDecisionScreen({super.key, required this.reviewId});

  final String reviewId;

  @override
  State<ApprovalDecisionScreen> createState() => _ApprovalDecisionScreenState();
}

class _ApprovalDecisionScreenState extends State<ApprovalDecisionScreen> {
  DocStatus? _decided;
  String? _toast;

  Future<void> _decide(DocStatus target, String label) async {
    // Bước 2 của luồng chính: hộp thoại xác nhận. Bắt buộc theo `1-UC-07`.
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('$label tài liệu này?'),
        content: const Text(
          'Trạng thái sẽ đổi và giảng viên nhận thông báo. '
          'Hành động này có thể thực hiện lại nếu bấm nhầm.',
        ),
        // Dùng `DialogAction` thay vì `TextButton`/`FilledButton` trần: nút trong
        // `AlertDialog.actions` bị ràng buộc tight 40dp nên `minimumSize` của
        // theme bị vô hiệu — đã đo được 46,6×40 trước khi sửa.
        actions: [
          DialogAction.cancel(
            onPressed: () => Navigator.of(ctx).pop(false), // A1: huỷ, không toast
            child: const Text('Huỷ'),
          ),
          DialogAction.confirm(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(label),
          ),
        ],
      ),
    );

    if (ok != true || !mounted) return;

    // Bước 3-4: đổi trạng thái + toast xác nhận.
    final sent = ReviewRepository.instance.write(
      id: widget.reviewId,
      label: label,
      payload: target.name,
    );
    setState(() {
      _decided = target;
      _toast = sent
          ? 'Đã $label. Trạng thái đã cập nhật.'
          : 'Đang mất mạng — đã xếp hàng, sẽ gửi lại khi có mạng.';
    });
  }

  @override
  Widget build(BuildContext context) {
    final r = ReviewRepository.instance.byId(widget.reviewId);
    if (r == null) {
      return ErrorState(
        title: 'Không tìm thấy tài liệu',
        message: 'Không có tài liệu với mã "${widget.reviewId}".',
        onRetry: () => Navigator.of(context).pop(),
      );
    }
    final status = _decided ?? r.status;

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(r.documentTitle, style: AppText.sectionTitle),
              const SizedBox(height: AppSpace.xs),
              Text('${r.classCode} · ${r.groupName} · ${r.version}',
                  style: AppText.micro),
              const SizedBox(height: AppSpace.l),
              // `Expanded` cho nhãn + chip bọc `Flexible`: thiếu hai thứ này thì
              // `Row` tràn ngang khi nhãn trạng thái dài (đo được tràn 188px
              // trong `flutter test`). Không phải lỗi thẩm mỹ — nội dung bị cắt.
              Row(
                children: [
                  Expanded(
                    child: Text('Trạng thái hiện tại', style: AppText.micro),
                  ),
                  const SizedBox(width: AppSpace.s),
                  Flexible(child: StatusChip.of(status)),
                ],
              ),
              const SizedBox(height: AppSpace.l),
              Text(
                'Từ đây tới lúc xong chỉ cần 2 lần bấm: mở xác nhận, rồi xác nhận. '
                'Không có bước trung gian nào khác.',
                style: AppText.micro,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        if (_toast != null) ...[
          _toastBox(_toast!),
          const SizedBox(height: AppSpace.l),
        ],
        _decisionBar(status),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _toastBox(String msg) => Container(
    padding: const EdgeInsets.all(AppSpace.m),
    decoration: const BoxDecoration(
      color: AppColors.brandTint,
      borderRadius: AppRadius.buttonAll,
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.check_circle_outline, size: 18, color: AppColors.brand),
        const SizedBox(width: AppSpace.s),
        Expanded(child: Text(msg, style: AppText.bodySmall)),
      ],
    ),
  );

  /// Thanh quyết định — cả hai nút đều >= 48dp (C4).
  Widget _decisionBar(DocStatus status) {
    final finished = status == DocStatus.approved || status == DocStatus.notAccepted;
    if (finished) {
      return AppCard(
        child: Row(
          children: [
            Icon(Icons.lock_outline, size: 18, color: ToneColors.fg(status.tone)),
            const SizedBox(width: AppSpace.s),
            Expanded(
              child: Text(
                'Tài liệu đã ở trạng thái cuối — không đổi được nữa.',
                style: AppText.micro,
              ),
            ),
          ],
        ),
      );
    }

    return Row(
      children: [
        Expanded(
          child: _barButton(
            label: 'Yêu cầu chỉnh sửa',
            icon: Icons.edit_note_outlined,
            danger: true,
            onTap: () => _decide(DocStatus.needsRevision, 'Yêu cầu chỉnh sửa'),
          ),
        ),
        const SizedBox(width: AppSpace.m),
        Expanded(
          child: _barButton(
            label: 'Phê duyệt',
            icon: Icons.check_circle_outline,
            danger: false,
            onTap: () => _decide(DocStatus.approved, 'Phê duyệt'),
          ),
        ),
      ],
    );
  }

  Widget _barButton({
    required String label,
    required IconData icon,
    required bool danger,
    required VoidCallback onTap,
  }) {
    final bg = danger ? AppColors.danger : AppColors.brand;
    return Semantics(
      button: true,
      label: label,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadius.buttonAll,
        child: Container(
          constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpace.m,
            vertical: AppSpace.m,
          ),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: AppRadius.buttonAll,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 20, color: Colors.white),
              const SizedBox(width: AppSpace.s),
              Flexible(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: AppText.label.copyWith(color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}