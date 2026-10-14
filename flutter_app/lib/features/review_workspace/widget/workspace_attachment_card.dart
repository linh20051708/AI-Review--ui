// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';
import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';

/// S04 — Dòng tệp đính kèm (`1-UC-06`, US04).
///
/// Bấm vào mở sheet xem trước, nên gọi ngược lên trang qua `onOpenPreview`
/// thay vì tự gọi `Navigator` — widget không tự điều hướng.
class WorkspaceAttachmentCard extends StatelessWidget {
  const WorkspaceAttachmentCard({
    super.key,
    required this.review,
    required this.onOpenPreview,
  });

  final ReviewRequest review;
  final VoidCallback onOpenPreview;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: 'Mở tài liệu ${review.documentTitle} ${review.version}',
      child: InkWell(
        // Từng là `onTap: () {}` — NÚT CHẾT. Tệ hơn nút chết thường vì khối này
        // tự khai `Semantics(button: true, label: 'Mở tài liệu ...')`: trình đọc
        // màn hình đọc lên như một nút mở được tài liệu, mà bấm không có gì xảy
        // ra. Giờ mở một sheet xem trước thật. Xem `test/dead_control_test.dart`.
        onTap: onOpenPreview,
        borderRadius: AppRadius.buttonAll,
        child: Container(
          constraints: const BoxConstraints(minHeight: AppSpace.tapMin + 24),
          padding: const EdgeInsets.all(AppSpace.m),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadius.buttonAll,
            border: Border.all(color: AppColors.line),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: const BoxDecoration(
                  color: AppColors.brandTint,
                  borderRadius: AppRadius.chipAll,
                ),
                child: const Icon(
                  Icons.picture_as_pdf_outlined,
                  size: 20,
                  color: AppColors.brand,
                ),
              ),
              const SizedBox(width: AppSpace.m),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${review.documentTitle.toLowerCase().replaceAll(' ', '-')}'
                          '-${review.version}.pdf',
                      style: AppText.bodySmall,
                    ),
                    Text('Xem trước 12 trang', style: AppText.micro),
                  ],
                ),
              ),
              const Icon(Icons.open_in_new, size: 18, color: AppColors.muted),
            ],
          ),
        ),
      ),
    );
  }
}
