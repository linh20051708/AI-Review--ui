// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/status_chip.dart';
import '../state/workspace_state.dart';

/// S04 — Thẻ thông tin tài liệu đang review (`1-UC-06`, US04).
///
/// Là widget CON duy nhất đọc trạng thái vừa quyết định (`WorkspaceState.of`).
/// Trước đây nó đọc biến `_decided` của `State`, nên phải nằm cùng tệp với
/// trang; tách ra thì chỉ phụ thuộc `WorkspaceState`.
class WorkspaceDocCard extends StatelessWidget {
  const WorkspaceDocCard({super.key});

  @override
  Widget build(BuildContext context) {
    final r = WorkspaceState.of(context).review;
    // Chip trạng thái lấy quyết định vừa đưa ra nếu có, ngược lại lấy trạng
    // thái đã lưu — nguồn chân lý chỉ một, không tự tính lại.
    final decided = WorkspaceState.of(context).decided;

    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  '${r.classCode} · ${r.groupName}',
                  style: AppText.micro,
                ),
              ),
              // `Flexible`: chip phải chịu được bề rộng hẹp. Thiếu nó thì
              // `Row` tràn 6,3px ở 320dp (đo trong `test/overflow_test.dart`).
              Flexible(child: StatusChip.of(decided ?? r.status)),
            ],
          ),
          const SizedBox(height: AppSpace.s),
          Text(r.documentTitle, style: AppText.sectionTitle),
          const SizedBox(height: AppSpace.xs),
          Text(r.projectName, style: AppText.body),
          const SizedBox(height: AppSpace.m),
          const Divider(),
          const SizedBox(height: AppSpace.m),
          _KeyValue('Phiên bản', r.version),
          _KeyValue('Người nộp', r.submitter),
          _KeyValue('Thời điểm nộp', r.submittedAt),
          if (r.note != null) ...[
            const SizedBox(height: AppSpace.m),
            Container(
              padding: const EdgeInsets.all(AppSpace.m),
              decoration: const BoxDecoration(
                color: AppColors.amberSoft,
                borderRadius: AppRadius.buttonAll,
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 16, color: AppColors.amber),
                  const SizedBox(width: AppSpace.s),
                  Expanded(
                    child: Text(
                      r.note!,
                      style: AppText.micro.copyWith(color: AppColors.amber),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Một dòng "nhãn — giá trị". Giữ private trong tệp này: chỉ có thẻ tài liệu
/// dùng tới (trước đây là `_kv` của `State`).
class _KeyValue extends StatelessWidget {
  const _KeyValue(this.label, this.value);

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.s),
      child: Row(
        children: [
          SizedBox(width: 110, child: Text(label, style: AppText.micro)),
          Expanded(child: Text(value, style: AppText.bodySmall)),
        ],
      ),
    );
  }
}
