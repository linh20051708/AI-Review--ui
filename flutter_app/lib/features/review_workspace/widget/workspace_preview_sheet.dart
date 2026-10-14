// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';
import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';

/// Sheet xem trước tài liệu.
///
/// Không có backend thật nên không tải được PDF: sheet hiện đúng những gì hệ
/// thống BIẾT về tệp (tên, phiên bản, số trang, người nộp, thời điểm) và nói
/// rõ đây là bản demo. Không bịa nội dung trang.
Future<void> showWorkspacePreviewSheet(
  BuildContext context,
  ReviewRequest r,
) {
  final fileName =
      '${r.documentTitle.toLowerCase().replaceAll(' ', '-')}-${r.version}.pdf';
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (ctx) => SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpace.pagePad,
          0,
          AppSpace.pagePad,
          AppSpace.pagePad,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fileName, style: AppText.sectionTitle),
            const SizedBox(height: AppSpace.s),
            Row(
              children: [
                const Icon(Icons.description_outlined,
                    size: 18, color: AppColors.muted),
                const SizedBox(width: AppSpace.s),
                Expanded(
                  child: Text(
                    'Xem trước 12 trang · ${r.version} · ${r.submitter}',
                    style: AppText.micro,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpace.m),
            Container(
              height: 180,
              width: double.infinity,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.subtle,
                borderRadius: AppRadius.cardAll,
                border: Border.all(color: AppColors.line),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.picture_as_pdf_outlined,
                      size: 32, color: AppColors.muted),
                  const SizedBox(height: AppSpace.s),
                  Text(
                    'Bản demo chưa nối máy chủ tệp — chưa dựng được nội dung '
                    'trang.',
                    style: AppText.micro,
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpace.m),
            SizedBox(
              height: AppSpace.tapMin,
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Đóng'),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
