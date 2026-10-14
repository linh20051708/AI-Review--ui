import 'package:flutter/material.dart';

import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';
import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_shared_status_chip.dart';
import '../../shared/011_CORE_tone_colors.dart';

/// Thẻ yêu cầu review trong danh sách.
///
/// Đích chạm của thẻ luôn >= 48dp (C4): phần nội dung đã cao hơn ngưỡng này
/// kể cả khi chỉ có một dòng nhãn, và nút bên trong cũng dùng `AppSpace.tapMin`.
class ReviewCard extends StatelessWidget {
  const ReviewCard({super.key, required this.item, required this.onTap});

  final ReviewRequest item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => AppCard(
    margin: const EdgeInsets.only(bottom: AppSpace.m),
    onTap: onTap,
    semanticLabel:
        '${item.groupName}, ${item.projectName}, tài liệu ${item.documentTitle} '
        '${item.version}, trạng thái ${item.status.label}',
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                '${item.classCode} · ${item.groupName}',
                style: AppText.micro,
              ),
            ),
            const SizedBox(width: AppSpace.s),
            StatusChip.of(item.status),
          ],
        ),
        const SizedBox(height: AppSpace.s),
        Text(item.documentTitle, style: AppText.blockTitle),
        const SizedBox(height: AppSpace.xs),
        Text(item.projectName, style: AppText.micro),
        const SizedBox(height: AppSpace.m),
        const Divider(),
        const SizedBox(height: AppSpace.s),
        Row(
          children: [
            Expanded(
              child: Text(
                '${item.version} · ${item.submitter}',
                style: AppText.micro,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            const SizedBox(width: AppSpace.s),
            if (item.aiTotal > 0)
              _AiCounts(
                errors: item.aiErrors,
                warnings: item.aiWarnings,
                suggestions: item.aiSuggestions,
              ),
          ],
        ),
      ],
    ),
  );
}

class _AiCounts extends StatelessWidget {
  const _AiCounts({
    required this.errors,
    required this.warnings,
    required this.suggestions,
  });

  final int errors;
  final int warnings;
  final int suggestions;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      if (errors > 0) _dot(errors, AppColors.rust),
      if (warnings > 0) _dot(warnings, AppColors.amber),
      if (suggestions > 0) _dot(suggestions, AppColors.olive),
    ],
  );

  Widget _dot(int n, Color c) => Padding(
    padding: const EdgeInsets.only(left: AppSpace.s),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(color: c, shape: BoxShape.circle),
        ),
        const SizedBox(width: AppSpace.xs),
        Text('$n', style: AppText.micro.copyWith(color: c)),
      ],
    ),
  );
}

/// Thẻ phát hiện của AI.
class AiFindingCard extends StatelessWidget {
  const AiFindingCard({super.key, required this.finding});

  final AiFinding finding;

  @override
  Widget build(BuildContext context) {
    final fg = ToneColors.fg(finding.level.tone);

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpace.m),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 4,
                height: 16,
                decoration: BoxDecoration(
                  color: fg,
                  borderRadius: AppRadius.chipAll,
                ),
              ),
              const SizedBox(width: AppSpace.s),
              StatusChip(label: finding.level.label, tone: finding.level.tone),
              const Spacer(),
              Text(finding.pageRef, style: AppText.micro),
            ],
          ),
          const SizedBox(height: AppSpace.m),
          Text(finding.category, style: AppText.label.copyWith(color: fg)),
          const SizedBox(height: AppSpace.xs),
          Text(finding.message, style: AppText.body),
        ],
      ),
    );
  }
}

/// Thẻ dòng bảng kiểm của AI.
class AiCheckRow extends StatelessWidget {
  const AiCheckRow({super.key, required this.check});

  final AiCheck check;

  @override
  Widget build(BuildContext context) {
    final fg = ToneColors.fg(check.tone);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpace.m),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(width: AppSpace.s),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(check.title, style: AppText.bodySmall),
                const SizedBox(height: AppSpace.xs),
                Text(check.detail, style: AppText.micro),
              ],
            ),
          ),
          const SizedBox(width: AppSpace.s),
          Container(
            constraints: const BoxConstraints(minHeight: 24),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpace.s,
              vertical: AppSpace.xs,
            ),
            decoration: BoxDecoration(
              color: ToneColors.bg(check.tone),
              borderRadius: AppRadius.chipAll,
            ),
            child: Center(
              child: Text(
                check.result,
                style: AppText.label.copyWith(color: fg, fontSize: 11),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
