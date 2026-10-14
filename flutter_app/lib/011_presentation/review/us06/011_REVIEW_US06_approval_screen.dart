import 'package:flutter/material.dart';

import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_shared_status_chip.dart';
import '../../shared/011_CORE_tone_colors.dart';
import '../../shared/011_CORE_US11_offline_banner.dart';
import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';

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
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false), // A1: huỷ, không toast
            child: const Text('Huỷ'),
          ),
          FilledButton(
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
              Row(
                children: [
                  Text('Trạng thái hiện tại', style: AppText.micro),
                  const SizedBox(width: AppSpace.s),
                  StatusChip.of(status),
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
