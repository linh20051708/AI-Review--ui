import 'package:flutter/material.dart';

import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_US11_offline_banner.dart';
import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';

/// S04 phụ trợ — Chuẩn nào đang áp **ngay tại chỗ ra quyết định** (`1-UC-14`, US13).
///
/// US13 không đòi một trang quản trị chuẩn. Nó đòi: lúc giảng viên sắp bấm
/// phê duyệt, họ thấy được **đang áp chuẩn nào và hạn là khi nào** — không phải
/// mở tab khác rồi quay lại quên mất. Nên màn này đặt cạnh thanh quyết định.
class ActiveRuleSetScreen extends StatefulWidget {
  const ActiveRuleSetScreen({super.key, required this.reviewId});

  final String reviewId;

  @override
  State<ActiveRuleSetScreen> createState() => _ActiveRuleSetScreenState();
}

class _ActiveRuleSetScreenState extends State<ActiveRuleSetScreen> {
  int _picked = 0;

  @override
  Widget build(BuildContext context) {
    final sets = ReviewRepository.instance.ruleSets();
    final r = ReviewRepository.instance.byId(widget.reviewId);
    if (r == null) {
      return ErrorState(
        title: 'Không tìm thấy tài liệu',
        message: 'Không có tài liệu với mã "${widget.reviewId}".',
        onRetry: () => Navigator.of(context).pop(),
      );
    }
    final active = sets[_picked];

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.rule_folder_outlined,
                      size: 20, color: AppColors.brand),
                  const SizedBox(width: AppSpace.s),
                  Text('Chuẩn đang áp', style: AppText.micro),
                ],
              ),
              const SizedBox(height: AppSpace.m),
              Text(active.name, style: AppText.sectionTitle),
              const SizedBox(height: AppSpace.xs),
              Text(active.appliesTo, style: AppText.micro),
              const SizedBox(height: AppSpace.l),
              Container(
                padding: const EdgeInsets.all(AppSpace.m),
                decoration: const BoxDecoration(
                  color: AppColors.amberSoft,
                  borderRadius: AppRadius.buttonAll,
                ),
                child: Row(
                  children: [
                    const Icon(Icons.schedule,
                        size: 18, color: AppColors.amber),
                    const SizedBox(width: AppSpace.s),
                    Expanded(
                      child: Text(
                        'Hạn áp dụng: ${active.deadline}',
                        style: AppText.bodySmall
                            .copyWith(color: AppColors.amber),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        Text('Bộ chuẩn khác', style: AppText.blockTitle),
        const SizedBox(height: AppSpace.s),
        Wrap(
          spacing: AppSpace.s,
          runSpacing: AppSpace.s,
          children: [
            for (var i = 0; i < sets.length; i++)
              _option(sets[i].version, i == _picked, () =>
                  setState(() => _picked = i)),
          ],
        ),
        const SizedBox(height: AppSpace.l),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Chuẩn này bắt buộc gì', style: AppText.blockTitle),
              const SizedBox(height: AppSpace.s),
              for (final c in active.checks) _checkRow(c),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        // Đặt quyết định NGAY DƯỚI chuẩn — đó là điểm của US13.
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Ra quyết định cho tài liệu này',
                  style: AppText.blockTitle),
              const SizedBox(height: AppSpace.xs),
              Text('${r.documentTitle} · ${r.version}', style: AppText.micro),
              const SizedBox(height: AppSpace.m),
              Text(
                'Chuẩn "${active.name}" đang áp cho tài liệu này. '
                'Kiểm lại các mục bắt buộc ở trên trước khi bấm.',
                style: AppText.micro,
              ),
              const SizedBox(height: AppSpace.m),
              Row(
                children: [
                  Expanded(
                    child: _decision(
                      label: 'Yêu cầu chỉnh sửa',
                      icon: Icons.edit_note_outlined,
                      danger: true,
                      onTap: () => _decide(DocStatus.needsRevision),
                    ),
                  ),
                  const SizedBox(width: AppSpace.m),
                  Expanded(
                    child: _decision(
                      label: 'Phê duyệt',
                      icon: Icons.check_circle_outline,
                      danger: false,
                      onTap: () => _decide(DocStatus.approved),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  void _decide(DocStatus target) {
    ReviewRepository.instance.write(
      id: widget.reviewId,
      label: target == DocStatus.approved ? 'Phê duyệt' : 'Yêu cầu chỉnh sửa',
      payload: target.name,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Đã ghi nhận: ${target.label}')),
    );
  }

  Widget _option(String label, bool selected, VoidCallback onTap) => Semantics(
    button: true,
    selected: selected,
    label: label,
    child: InkWell(
      onTap: onTap,
      borderRadius: AppRadius.chipAll,
      child: Container(
        constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.l),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? AppColors.brand : AppColors.subtle,
          borderRadius: AppRadius.chipAll,
          border: Border.all(
            color: selected ? AppColors.brand : AppColors.line,
          ),
        ),
        child: Text(
          label,
          style: AppText.label.copyWith(
            color: selected ? Colors.white : AppColors.muted,
          ),
        ),
      ),
    ),
  );

  Widget _checkRow(String text) => Padding(
    padding: const EdgeInsets.symmetric(vertical: AppSpace.s),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.check, size: 18, color: AppColors.olive),
        const SizedBox(width: AppSpace.m),
        Expanded(child: Text(text, style: AppText.bodySmall)),
      ],
    ),
  );

  Widget _decision({
    required String label,
    required IconData icon,
    required bool danger,
    required VoidCallback onTap,
  }) =>
      Semantics(
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
              color: danger ? AppColors.danger : AppColors.brand,
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
