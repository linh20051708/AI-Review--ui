import 'package:flutter/material.dart';

import '../../101_domain_entities/101_DOMAIN_review_entities.dart';
import '../../001_core/theme/001_CORE_spacing.dart';
import '../../001_core/theme/001_CORE_typography.dart';
import './011_CORE_tone_colors.dart';

/// Chip trạng thái — luôn hiển thị nhãn tiếng Việt, không chỉ dựa vào màu.
class StatusChip extends StatelessWidget {
  const StatusChip({
    super.key,
    required this.label,
    required this.tone,
    this.icon,
  });

  factory StatusChip.of(DocStatus status, {Key? key}) =>
      StatusChip(key: key, label: status.label, tone: status.tone);

  final String label;
  final Tone tone;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final fg = ToneColors.fg(tone);
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpace.s,
        vertical: AppSpace.xs,
      ),
      decoration: BoxDecoration(
        color: ToneColors.bg(tone),
        borderRadius: AppRadius.chipAll,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: fg),
            const SizedBox(width: AppSpace.xs),
          ],
          Text(
            label,
            style: AppText.label.copyWith(color: fg, fontSize: 11),
          ),
        ],
      ),
    );
  }
}

/// Thẻ số liệu trên Tổng quan.
class StatCard extends StatelessWidget {
  const StatCard({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
    this.tone = Tone.brand,
    this.onTap,
  });

  final String label;
  final String value;
  final IconData icon;
  final Tone tone;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final fg = ToneColors.fg(tone);

    final body = Container(
      padding: const EdgeInsets.all(AppSpace.m),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.cardAll,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: ToneColors.bg(tone),
              borderRadius: AppRadius.chipAll,
            ),
            child: Icon(icon, size: 16, color: fg),
          ),
          const SizedBox(height: AppSpace.xs),
          // Nội dung chữ co theo ô lưới: ô thấp thì thu nhỏ, không tràn.
          Expanded(
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.bottomLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(value, style: AppText.sectionTitle),
                  const SizedBox(height: AppSpace.xs),
                  Text(label, style: AppText.micro),
                ],
              ),
            ),
          ),
        ],
      ),
    );

    return Container(
      decoration: BoxDecoration(
        borderRadius: AppRadius.cardAll,
        border: Border.all(color: Theme.of(context).colorScheme.outline),
      ),
      clipBehavior: Clip.antiAlias,
      child: onTap == null
          ? body
          : Semantics(button: true, label: '$label: $value',
              child: InkWell(onTap: onTap, child: body)),
    );
  }
}
