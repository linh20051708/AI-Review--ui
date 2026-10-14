// CMPlan: tầng 011 · SUBMIT · US10 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../shared/theme/color_tokens.dart';
import '../../shared/theme/spacing.dart';
import '../../shared/theme/typography.dart';
import '../../data/repositories/review_repository.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_chip.dart';
import '../../domain/entities/review_entities.dart';

/// S09 — Nút nộp **kèm lý do khi bị khoá** (`1-UC-11`, US10).
///
/// Đây là màn trả lời câu hỏi "vì sao tôi không nộp được". Quy tắc nghiệp vụ
/// PN-08: **cấm** nút khoá im lặng. Mỗi mục còn thiếu phải hiện `reason`.
///
/// Màn cố ý hiển thị cả mục không chặn (nhóm chưa đủ thành viên) để chứng minh
/// không phải mọi mục thiếu đều chặn nộp — nếu chặn hết thì đây là lỗi UX.
class SubmitGateScreen extends StatefulWidget {
  const SubmitGateScreen({super.key});

  @override
  State<SubmitGateScreen> createState() => _SubmitGateScreenState();
}

class _SubmitGateScreenState extends State<SubmitGateScreen> {
  String? _result;

  void _submit() {
    final repo = ReviewRepository.instance;
    if (!repo.canSubmit) return; // nút đã bị khoá, không thể tới đây
    // SỬA (đợt 9): từng `id: 'submit'` + `payload: 'sequence-diagram-v2.pdf'`
    // — id KHÔNG tồn tại và payload là TÊN TỆP, nên `_apply()` lặng lẽ bỏ qua
    // còn màn báo "Đã nộp. Giảng viên sẽ nhận được thông báo." Giờ gõ đúng id
    // tài liệu thật và đúng tên trạng thái. Tên tệp đi vào `label`.
    final blockerDoc = repo.requests().firstWhere(
          (r) => r.status == DocStatus.needsRevision ||
              r.status == DocStatus.waiting,
        );
    final sent = repo.write(
      id: blockerDoc.id,
      label: 'Nộp tài liệu',
      payload: DocStatus.submitted.name,
    );
    // `write()` giờ chỉ trả true khi THẬT SỰ đổi được trạng thái.
    setState(() => _result = sent
        ? 'Đã nộp. Giảng viên sẽ nhận được thông báo.'
        : (repo.isOffline
            ? 'Đang mất mạng — đã xếp hàng, sẽ nộp lại khi có mạng.'
            : 'Chưa nộp được — tài liệu không đổi trạng thái.'));
  }

  @override
  Widget build(BuildContext context) {
    final repo = ReviewRepository.instance;
    final items = repo.submitChecklist();
    final blockers = repo.submitBlockers();
    final canSubmit = repo.canSubmit;

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Nộp tài liệu', style: AppText.sectionTitle),
              const SizedBox(height: AppSpace.xs),
              Text('Sequence Diagram · v2 · Trần Hoàng Nam',
                  style: AppText.micro),
              const SizedBox(height: AppSpace.l),
              StatusChip(
                label: canSubmit
                    ? 'Đủ điều kiện nộp'
                    : '${blockers.length} mục đang chặn',
                tone: canSubmit ? Tone.brand : Tone.rust,
                icon: canSubmit
                    ? Icons.check_circle_outline
                    : Icons.lock_outline,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Danh sách kiểm', style: AppText.blockTitle),
              const SizedBox(height: AppSpace.s),
              for (final it in items) _checkRow(it),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        _submitBar(canSubmit, blockers),
        if (_result != null) ...[
          const SizedBox(height: AppSpace.l),
          _resultBox(_result!),
        ],
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _checkRow(SubmitChecklistItem it) {
    final blocking = it.blocking && !it.done;
    final color = it.done
        ? AppColors.olive
        : (blocking ? AppColors.danger : AppColors.muted);
    final icon = it.done
        ? Icons.check_circle_outline
        : (blocking ? Icons.block : Icons.radio_button_unchecked);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpace.s),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: color),
          const SizedBox(width: AppSpace.m),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(it.label, style: AppText.bodySmall),
                const SizedBox(height: AppSpace.xs),
                // LÝ DO — bắt buộc hiện, kể cả khi không chặn.
                Text(
                  it.reason,
                  style: AppText.micro.copyWith(
                    color: blocking ? AppColors.danger : AppColors.muted,
                  ),
                ),
              ],
            ),
          ),
          if (blocking)
            const StatusChip(label: 'Đang chặn', tone: Tone.danger),
        ],
      ),
    );
  }

  /// Nút nộp: khoá thì PHẢI kèm chữ lý do ngay dưới (PN-08).
  Widget _submitBar(bool canSubmit, List<SubmitChecklistItem> blockers) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Semantics(
          button: true,
          enabled: canSubmit,
          label: canSubmit ? 'Nộp tài liệu' : 'Nộp tài liệu — đang bị khoá',
          child: InkWell(
            onTap: canSubmit ? _submit : null,
            borderRadius: AppRadius.buttonAll,
            child: Container(
              constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
              padding: const EdgeInsets.symmetric(vertical: AppSpace.m),
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: canSubmit ? AppColors.brand : AppColors.subtle,
                borderRadius: AppRadius.buttonAll,
                border: Border.all(
                  color: canSubmit ? AppColors.brand : AppColors.line,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    canSubmit ? Icons.upload_outlined : Icons.lock_outline,
                    size: 20,
                    color: canSubmit ? Colors.white : AppColors.muted,
                  ),
                  const SizedBox(width: AppSpace.s),
                  Text(
                    'Nộp tài liệu',
                    style: AppText.label.copyWith(
                      color: canSubmit ? Colors.white : AppColors.muted,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (!canSubmit) ...[
          const SizedBox(height: AppSpace.s),
          // Chữ lý do — chỗ sửa của PN-08.
          Text(
            'Chưa nộp được vì: ${blockers.map((b) => b.label).join(', ')}. '
            'Xử lý xong các mục "Đang chặn" ở trên rồi quay lại.',
            style: AppText.micro.copyWith(color: AppColors.danger),
          ),
        ],
      ],
    );
  }

  Widget _resultBox(String msg) => Container(
    padding: const EdgeInsets.all(AppSpace.m),
    decoration: const BoxDecoration(
      color: AppColors.brandTint,
      borderRadius: AppRadius.buttonAll,
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.info_outline, size: 18, color: AppColors.brand),
        const SizedBox(width: AppSpace.s),
        Expanded(child: Text(msg, style: AppText.bodySmall)),
      ],
    ),
  );
}
