// CMPlan: tầng 011 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../domain/entities/review_entities.dart';
import '../theme/spacing.dart';
import '../theme/typography.dart';
import './tone_colors.dart';

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
          // `Flexible` quanh `Text`: chip là widget DÙNG CHUNG, có chỗ nhét
          // trong `Row` hẹp (ô lưới, thanh trạng thái). Nhãn dài như
          // "Đã yêu cầu chỉnh sửa" từng làm `Row` này tràn 113px —
          // đo được bằng `flutter test`, không thấy được khi lái trình duyệt.
          // Cho chữ xuống dòng thay vì tràn: thà chip cao hơn còn hơn mất chữ.
          Flexible(
            child: Text(
              label,
              style: AppText.label.copyWith(color: fg, fontSize: 11),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
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
      // Bọc TOÀN BỘ nội dung trong `FittedBox` + `mainAxisSize.min`:
      //
      // LỖI THẬT ĐÃ SỬA (14/10, đợt 2). `StatCard` từng hỏng theo HAI kiểu,
      // tuỳ cha — cả hai đều bung ở MỌI màn dùng nó:
      //   1. Cha CAO VÔ HẠN (mục trong `ListView`, `Row` không chốt cao) —
      //      `Expanded`/`Flexible` bên trong `Column` ném "RenderFlex children
      //      have non-zero flex but incoming height constraints are unbounded".
      //   2. Cha CHỐT cao nhưng THẤP (`GridView` 2 cột, `childAspectRatio:1.6`
      //      ở 320dp ⇒ ô chỉ còn ~100dp) — nội dung cao hơn ô nên `Column`
      //      tràn xuống dưới 17–48px.
      //
      // Bỏ flex (hết lỗi 1) + bọc `FittedBox` quanh cả cột (hết lỗi 2: ô thấp
      // thì thu nhỏ chữ, không tràn). `mainAxisSize.min` để cột tự cao theo
      // nội dung, không đòi hỏi cha phải hữu hạn.
      child: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.topLeft,
        child: Column(
          mainAxisSize: MainAxisSize.min,
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
            Text(value, style: AppText.sectionTitle),
            const SizedBox(height: AppSpace.xs),
            Text(label, style: AppText.micro),
          ],
        ),
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
