// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';
import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';
import '../../../shared/widgets/app_card.dart';
import '../../../shared/widgets/tone_colors.dart';

/// S04 — Thẻ "Tiến độ review": ba mảng tiến độ của một tài liệu (`1-UC-06`, US04).
class WorkspaceTrackCard extends StatelessWidget {
  const WorkspaceTrackCard({super.key, required this.review});

  final ReviewRequest review;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Tiến độ review', style: AppText.blockTitle),
          const SizedBox(height: AppSpace.m),
          _Track(
            'AI đã review',
            1,
            Tone.olive,
            '${review.aiErrors} lỗi · ${review.aiWarnings} cảnh báo · '
                '${review.aiSuggestions} gợi ý',
          ),
          const _Track(
            'Giảng viên review',
            0.5,
            Tone.brand,
            'Đang chờ quyết định',
          ),
          const _Track(
            'Feedback đã gửi',
            0.5,
            Tone.amber,
            '1 feedback cũ',
          ),
        ],
      ),
    );
  }
}

/// Một mảng tiến độ: nhãn + số liệu bên trên, thanh tiến độ bên dưới.
class _Track extends StatelessWidget {
  const _Track(this.label, this.progress, this.tone, this.meta);

  final String label;
  final double progress;
  final Tone tone;
  final String meta;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.m),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                flex: 2,
                child: Text(
                  label,
                  style: AppText.bodySmall,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: AppSpace.s),
              Expanded(
                flex: 3,
                child: Text(
                  meta,
                  style: AppText.micro,
                  textAlign: TextAlign.right,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpace.xs),
          ClipRRect(
            borderRadius: AppRadius.chipAll,
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 6,
              backgroundColor: AppColors.subtle,
              valueColor: AlwaysStoppedAnimation<Color>(ToneColors.fg(tone)),
            ),
          ),
        ],
      ),
    );
  }
}
