// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';
import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';
import '../../../shared/widgets/app_card.dart';

/// S04 — Tóm tắt kết quả quét của AI (`1-UC-06`, US04).
class WorkspaceAiSummaryCard extends StatelessWidget {
  const WorkspaceAiSummaryCard({super.key, required this.review});

  final ReviewRequest review;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Row(
        children: [
          const Icon(Icons.auto_awesome_outlined, size: 20, color: AppColors.brand),
          const SizedBox(width: AppSpace.m),
          Expanded(
            child: Text(
              'AI đã quét tài liệu và tìm thấy ${review.aiErrors} lỗi, '
              '${review.aiWarnings} cảnh báo, ${review.aiSuggestions} gợi ý.',
              style: AppText.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}
