import 'package:flutter/material.dart';

import '../data/demo_data.dart';
import '../data/models.dart';
import '../theme/app_colors.dart';
import '../theme/app_space.dart';
import '../theme/app_text.dart';
import '../widgets/app_card.dart';
import '../widgets/review_card.dart';
import '../widgets/status_chip.dart';

/// S04 — Không gian review.
///
/// Có thanh quyết định dính đáy (2 nút, cao >= 48dp) và hộp thoại xác nhận
/// trước khi phê duyệt — không có ngõ cụt.
class ReviewWorkspaceScreen extends StatelessWidget {
  const ReviewWorkspaceScreen({super.key, required this.reviewId});

  final String reviewId;

  @override
  Widget build(BuildContext context) {
    final r = DemoData.byId(reviewId);

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.all(AppSpace.pagePad),
            children: [
              _docCard(r),
              const SizedBox(height: AppSpace.l),
              _tracks(r),
              const SizedBox(height: AppSpace.l),
              _sectionTitle('Tệp đính kèm'),
              const SizedBox(height: AppSpace.s),
              _attachment(r),
              const SizedBox(height: AppSpace.l),
              _sectionTitle('Lịch sử phiên bản'),
              const SizedBox(height: AppSpace.s),
              ...DemoData.versionLog.map(_versionRow),
              const SizedBox(height: AppSpace.l),
              _sectionTitle('Phát hiện của AI'),
              const SizedBox(height: AppSpace.s),
              _aiSummary(r),
              const SizedBox(height: AppSpace.s),
              ...DemoData.aiFindings
                  .take(3)
                  .map((f) => AiFindingCard(finding: f)),
              const SizedBox(height: AppSpace.s),
              OutlinedButton.icon(
                onPressed: () => Navigator.of(context).pushNamed(
                  '/reviews/ai-result',
                  arguments: r.id,
                ),
                icon: const Icon(Icons.auto_awesome_outlined, size: 18),
                label: Text('Xem tất cả ${DemoData.aiFindings.length} phát hiện'),
              ),
              const SizedBox(height: AppSpace.huge),
            ],
          ),
        ),
        _decisionBar(context, r),
      ],
    );
  }

  Widget _docCard(ReviewRequest r) => AppCard(
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
            StatusChip.of(r.status),
          ],
        ),
        const SizedBox(height: AppSpace.s),
        Text(r.documentTitle, style: AppText.sectionTitle),
        const SizedBox(height: AppSpace.xs),
        Text(r.projectName, style: AppText.body),
        const SizedBox(height: AppSpace.m),
        const Divider(),
        const SizedBox(height: AppSpace.m),
        _kv('Phiên bản', r.version),
        _kv('Người nộp', r.submitter),
        _kv('Thời điểm nộp', r.submittedAt),
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

  Widget _kv(String k, String v) => Padding(
    padding: const EdgeInsets.only(bottom: AppSpace.s),
    child: Row(
      children: [
        SizedBox(
          width: 110,
          child: Text(k, style: AppText.micro),
        ),
        Expanded(child: Text(v, style: AppText.bodySmall)),
      ],
    ),
  );

  Widget _tracks(ReviewRequest r) => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Tiến độ review', style: AppText.blockTitle),
        const SizedBox(height: AppSpace.m),
        _track('AI đã review', 1, Tone.olive, '3 lỗi · 6 cảnh báo · 5 gợi ý'),
        _track('Giảng viên review', 0.5, Tone.brand, 'Đang chờ quyết định'),
        _track('Feedback đã gửi', 0.5, Tone.amber, '1 feedback cũ'),
      ],
    ),
  );

  Widget _track(String label, double progress, Tone tone, String meta) => Padding(
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

  Widget _sectionTitle(String t) => Text(t, style: AppText.blockTitle);

  Widget _attachment(ReviewRequest r) => Semantics(
    button: true,
    label: 'Mở tài liệu ${r.documentTitle} ${r.version}',
    child: InkWell(
      onTap: () {},
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
              child: const Icon(Icons.picture_as_pdf_outlined,
                  size: 20, color: AppColors.brand),
            ),
            const SizedBox(width: AppSpace.m),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${r.documentTitle.toLowerCase().replaceAll(' ', '-')}-${r.version}.pdf',
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

  Widget _versionRow(
    ({String version, String fileName, String at, String status}) v,
  ) => Padding(
    padding: const EdgeInsets.only(bottom: AppSpace.s),
    child: Row(
      children: [
        Container(
          constraints: const BoxConstraints(
            minWidth: AppSpace.tapMin,
            minHeight: 24,
          ),
          padding: const EdgeInsets.symmetric(horizontal: AppSpace.s),
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: AppColors.subtle,
            borderRadius: AppRadius.chipAll,
          ),
          child: Text(v.version, style: AppText.label),
        ),
        const SizedBox(width: AppSpace.m),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(v.fileName, style: AppText.bodySmall),
              Text('${v.at} · ${v.status}', style: AppText.micro),
            ],
          ),
        ),
      ],
    ),
  );

  Widget _aiSummary(ReviewRequest r) => AppCard(
    child: Row(
      children: [
        const Icon(Icons.auto_awesome_outlined, size: 20, color: AppColors.brand),
        const SizedBox(width: AppSpace.m),
        Expanded(
          child: Text(
            'AI đã quét tài liệu và tìm thấy ${r.aiErrors} lỗi, '
            '${r.aiWarnings} cảnh báo, ${r.aiSuggestions} gợi ý.',
            style: AppText.bodySmall,
          ),
        ),
      ],
    ),
  );

  Widget _decisionBar(BuildContext context, ReviewRequest r) => Container(
    padding: const EdgeInsets.all(AppSpace.l),
    decoration: const BoxDecoration(
      color: Colors.white,
      border: Border(top: BorderSide(color: AppColors.line)),
    ),
    child: SafeArea(
      top: false,
      child: Row(
        children: [
          Expanded(
            child: OutlinedButton(
              onPressed: () => _confirm(
                context,
                title: 'Yêu cầu chỉnh sửa?',
                message:
                    'Sinh viên sẽ nhận được yêu cầu chỉnh sửa và phải tạo '
                    'phiên bản mới. Hành động này không thu hồi được.',
                confirmLabel: 'Gửi yêu cầu chỉnh sửa',
                destructive: true,
                onDone: () => _toast(context, 'Đã gửi yêu cầu chỉnh sửa.'),
              ),
              child: const Text('Cần chỉnh sửa'),
            ),
          ),
          const SizedBox(width: AppSpace.m),
          Expanded(
            child: FilledButton(
              onPressed: () => _confirm(
                context,
                title: 'Phê duyệt tài liệu?',
                message:
                    'Tài liệu ${r.documentTitle} ${r.version} sẽ được đánh dấu '
                    'đã phê duyệt và sinh viên có thể làm bước tiếp theo.',
                confirmLabel: 'Phê duyệt',
                destructive: false,
                onDone: () => _toast(context, 'Đã phê duyệt tài liệu.'),
              ),
              child: const Text('Phê duyệt'),
            ),
          ),
        ],
      ),
    ),
  );

  void _toast(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.ink,
      ),
    );
  }

  Future<void> _confirm(
    BuildContext context, {
    required String title,
    required String message,
    required String confirmLabel,
    required bool destructive,
    required VoidCallback onDone,
  }) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppRadius.dialogAll),
        title: Text(title, style: AppText.blockTitle),
        content: Text(message, style: AppText.body),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Huỷ'),
          ),
          FilledButton(
            style: destructive
                ? FilledButton.styleFrom(backgroundColor: AppColors.rust)
                : null,
            onPressed: () => Navigator.of(ctx).pop(true),
            child: Text(confirmLabel),
          ),
        ],
      ),
    );
    if (ok == true) onDone();
  }
}
