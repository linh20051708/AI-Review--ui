import 'package:flutter/material.dart';

import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_shared_status_chip.dart';
import '../../shared/011_CORE_US11_offline_banner.dart';
import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';

/// S07 — Yêu cầu chỉnh sửa và **huỷ được nếu bấm nhầm** (`1-UC-08`, US07).
///
/// Khác S06 ở chỗ: sau khi gửi, có một cửa sổ thoáng để bấm "Hoàn tác".
/// Đây là yêu cầu trực tiếp của US07 — đừng bấm nhầm là mất luôn.
class RequestRevisionScreen extends StatefulWidget {
  const RequestRevisionScreen({super.key, required this.reviewId});

  final String reviewId;

  @override
  State<RequestRevisionScreen> createState() => _RequestRevisionScreenState();
}

class _RequestRevisionScreenState extends State<RequestRevisionScreen> {
  final _note = TextEditingController();
  bool _sent = false;
  bool _undone = false;
  String? _error;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  bool get _canSend => _note.text.trim().length >= 10;

  void _send() {
    if (!_canSend) {
      // E1 của luồng: nói rõ vì sao chưa gửi được, không khoá im lặng.
      setState(() => _error =
          'Cần ghi lý do tối thiểu 10 ký tự để sinh viên biết phải sửa gì.');
      return;
    }
    // payload phải là tên `DocStatus` (đợt 9 sửa): từng truyền `_note.text`
    // — LỜI NHẮN người dùng gõ, không ánh xạ được nên `_apply()` lặng lẽ bỏ
    // qua và màn hiện đã gửi giả dối. Lời nhắn đi theo `label` để còn thấy.
    final sent = ReviewRepository.instance.write(
      id: widget.reviewId,
      label: 'Yêu cầu chỉnh sửa: ${_note.text.trim()}',
      payload: DocStatus.needsRevision.name,
    );
    setState(() {
      _error = null;
      _sent = true;
      _undone = false;
      if (!sent) {
        _error = 'Đang mất mạng — yêu cầu đã xếp hàng, gửi lại khi có mạng.';
      }
    });
  }

  /// Hoàn tác: trả về trạng thái trước đó. Đây là điểm khác biệt của US07.
  ///
  /// payload phải là tên `DocStatus` (đợt 9 sửa): từng gửi `'undo'` — không
  /// ánh xạ được nên hoàn tác lặng lẽ không làm gì. Tài liệu trước khi bị yêu
  /// cầu chỉnh sửa đang ở "Đã nộp/chờ" nên trả về `waiting`.
  void _undo() {
    ReviewRepository.instance.write(
      id: widget.reviewId,
      label: 'Hoàn tác yêu cầu chỉnh sửa',
      payload: DocStatus.waiting.name,
    );
    setState(() {
      _sent = false;
      _undone = true;
      _note.clear();
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
              // `Expanded` + `Flexible`: thiếu thì `Row` tràn ngang —
              // đo được 127px @320dp, 87px @360dp và **35px @412dp**
              // (bề rộng điện thoại thật) bằng `flutter test`.
              Row(
                children: [
                  Expanded(
                    child: Text('Trạng thái', style: AppText.micro),
                  ),
                  const SizedBox(width: AppSpace.s),
                  Flexible(
                    child: StatusChip.of(
                      _sent && !_undone
                          ? DocStatus.needsRevision
                          : r.status,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        if (_undone) ...[
          _notice(
            icon: Icons.undo,
            color: AppColors.olive,
            text: 'Đã hoàn tác. Tài liệu trở về trạng thái trước đó, '
                'sinh viên không nhận thông báo nào.',
          ),
          const SizedBox(height: AppSpace.l),
        ],
        if (_error != null) ...[
          _notice(
            icon: Icons.error_outline,
            color: AppColors.rust,
            text: _error!,
          ),
          const SizedBox(height: AppSpace.l),
        ],
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Lý do cần chỉnh sửa', style: AppText.blockTitle),
              const SizedBox(height: AppSpace.s),
              TextField(
                controller: _note,
                enabled: !_sent,
                maxLines: 4,
                minLines: 3,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(
                  hintText: 'Ví dụ: bổ sung trạng thái sau khi bị trả lại ở mục 4.2',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: AppSpace.s),
              Text(
                '${_note.text.trim().length}/10 ký tự tối thiểu',
                style: AppText.micro,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        if (!_sent)
          _action(
            label: 'Gửi yêu cầu chỉnh sửa',
            icon: Icons.send_outlined,
            enabled: _canSend,
            onTap: _send,
          )
        else
          Row(
            children: [
              Expanded(
                child: _action(
                  label: 'Hoàn tác',
                  icon: Icons.undo,
                  enabled: true,
                  onTap: _undo,
                ),
              ),
              const SizedBox(width: AppSpace.m),
              Expanded(
                child: _action(
                  label: 'Xong',
                  icon: Icons.check,
                  enabled: true,
                  onTap: () => Navigator.of(context).maybePop(),
                ),
              ),
            ],
          ),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _notice({
    required IconData icon,
    required Color color,
    required String text,
  }) =>
      Container(
        padding: const EdgeInsets.all(AppSpace.m),
        decoration: BoxDecoration(
          color: AppColors.subtle,
          borderRadius: AppRadius.buttonAll,
          border: Border.all(color: AppColors.line),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 18, color: color),
            const SizedBox(width: AppSpace.s),
            Expanded(child: Text(text, style: AppText.bodySmall)),
          ],
        ),
      );

  Widget _action({
    required String label,
    required IconData icon,
    required bool enabled,
    required VoidCallback onTap,
  }) =>
      Semantics(
        button: true,
        enabled: enabled,
        label: label,
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: AppRadius.buttonAll,
          child: Container(
            constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
            padding: const EdgeInsets.symmetric(vertical: AppSpace.m),
            decoration: BoxDecoration(
              color: enabled ? AppColors.brand : AppColors.subtle,
              borderRadius: AppRadius.buttonAll,
              border: Border.all(
                color: enabled ? AppColors.brand : AppColors.line,
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  icon,
                  size: 20,
                  color: enabled ? Colors.white : AppColors.muted,
                ),
                const SizedBox(width: AppSpace.s),
                Flexible(
                  child: Text(
                    label,
                    style: AppText.label.copyWith(
                      color: enabled ? Colors.white : AppColors.muted,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
}
