import 'package:flutter/material.dart';

import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_tone_colors.dart';
import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';

/// S11 — Sức khoẻ nhóm để phát hiện nhóm quá hạn (`1-UC-13`, US12).
///
/// Mục tiêu của US12: thấy nhóm có vấn đề **mà không phải mở từng nhóm**.
/// Nên màn này là danh sách, nhóm quá hạn lên đầu, có bộ lọc "chỉ nhóm quá hạn".
class GroupHealthScreen extends StatefulWidget {
  const GroupHealthScreen({super.key});

  @override
  State<GroupHealthScreen> createState() => _GroupHealthScreenState();
}

class _GroupHealthScreenState extends State<GroupHealthScreen> {
  bool _onlyOverdue = false;

  List<GroupHealth> get _visible => _onlyOverdue
      ? ReviewRepository.instance.overdueGroups()
      : ReviewRepository.instance.groupHealth();

  @override
  Widget build(BuildContext context) {
    final all = ReviewRepository.instance.groupHealth();
    final overdueCount = all.where((g) => g.overdue > 0).length;

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Sức khoẻ nhóm', style: AppText.sectionTitle),
              const SizedBox(height: AppSpace.xs),
              Text(
                '${all.length} nhóm · $overdueCount nhóm có việc quá hạn',
                style: AppText.micro,
              ),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        _filter(),
        const SizedBox(height: AppSpace.m),
        if (_visible.isEmpty)
          _empty(overdueCount == 0
              ? 'Không có nhóm nào quá hạn — mọi nhóm đang đúng tiến độ.'
              : 'Không có nhóm nào khớp bộ lọc.'),
        for (final g in _visible) _groupCard(g),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _filter() => Row(
    children: [
      _chip('Tất cả (${ReviewRepository.instance.groupHealth().length})',
          !_onlyOverdue, () => setState(() => _onlyOverdue = false)),
      const SizedBox(width: AppSpace.s),
      _chip('Chỉ quá hạn',
          _onlyOverdue, () => setState(() => _onlyOverdue = true)),
    ],
  );

  Widget _chip(String label, bool selected, VoidCallback onTap) => Semantics(
    button: true,
    selected: selected,
    label: label,
    child: InkWell(
      onTap: onTap,
      borderRadius: AppRadius.chipAll,
      child: Container(
        constraints: const BoxConstraints(
          minHeight: AppSpace.tapMin,
          minWidth: AppSpace.tapMin,
        ),
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

  Widget _empty(String msg) => Padding(
    padding: const EdgeInsets.only(top: AppSpace.xl),
    child: Column(
      children: [
        const Icon(Icons.check_circle_outline, size: 40, color: AppColors.olive),
        const SizedBox(height: AppSpace.m),
        Text(msg, textAlign: TextAlign.center, style: AppText.bodySmall),
      ],
    ),
  );

  Widget _groupCard(GroupHealth g) {
    final fg = ToneColors.fg(g.tone);
    final pct = (g.progress * 100).round();

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpace.s),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(g.groupName, style: AppText.bodySmall),
              ),
              if (g.overdue > 0)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpace.s,
                    vertical: AppSpace.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.dangerSoft,
                    borderRadius: AppRadius.chipAll,
                  ),
                  child: Text(
                    '${g.overdue} quá hạn',
                    style: AppText.micro.copyWith(color: AppColors.danger),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpace.xs),
          Text('${g.projectName} · ${g.memberCount} thành viên',
              style: AppText.micro),
          const SizedBox(height: AppSpace.m),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: AppRadius.chipAll,
                  child: LinearProgressIndicator(
                    value: g.progress,
                    minHeight: 8,
                    backgroundColor: AppColors.subtle,
                    valueColor: AlwaysStoppedAnimation<Color>(fg),
                  ),
                ),
              ),
              const SizedBox(width: AppSpace.m),
              Text('$pct%', style: AppText.label.copyWith(color: fg)),
            ],
          ),
          const SizedBox(height: AppSpace.s),
          Text('${g.doneCount}/${g.totalCount} hạng mục hoàn thành',
              style: AppText.micro),
        ],
      ),
    );
  }
}
