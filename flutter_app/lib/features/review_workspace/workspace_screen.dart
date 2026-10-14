// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../domain/entities/review_entities.dart';
import '../../shared/theme/color_tokens.dart';
import '../../shared/theme/spacing.dart';
import '../../shared/theme/typography.dart';
import '../../shared/widgets/app_card.dart';
import '../../features/request_list/review_card.dart';
import '../../shared/widgets/status_chip.dart';
import '../../shared/widgets/tone_colors.dart';
import '../../data/repositories/review_repository.dart';
import '../../shared/widgets/offline_banner.dart';
import '../../../shared/widgets/dialog_actions.dart';

/// S04 — Không gian review.
///
/// Có thanh quyết định dính đáy (2 nút, cao >= 48dp) và hộp thoại xác nhận
/// trước khi phê duyệt — không có ngõ cụt.
class ReviewWorkspaceScreen extends StatefulWidget {
  const ReviewWorkspaceScreen({super.key, required this.reviewId});

  final String reviewId;

  @override
  State<ReviewWorkspaceScreen> createState() => _ReviewWorkspaceScreenState();
}

class _ReviewWorkspaceScreenState extends State<ReviewWorkspaceScreen> {
  /// Quyết định đã ghi trong phiên này (`null` = chưa quyết định).
  ///
  /// VÌ SAO CẦN (14/10, đợt 3): màn này trước là `StatelessWidget` và hai nút
  /// quyết định **chỉ hiện toast**, KHÔNG gọi `ReviewRepository.write()`. Nghĩa
  /// là bấm "Phê duyệt" → hiện "Đã phê duyệt tài liệu." nhưng `status` không hề
  /// đổi và màn vẫn hiện chip cũ. App báo sai cho người dùng — cùng loại lỗi đã
  /// sửa ở `202_DOMAIN_review_repository.dart`. Xem
  /// `test/approve_flow_test.dart` (TC_US06_HP_04) khoá lại hành vi này.
  DocStatus? _decided;

  @override
  Widget build(BuildContext context) {
    final reviewId = widget.reviewId;
    final r = ReviewRepository.instance.byId(reviewId);

    // Tài liệu không tồn tại (id sai, hoặc đã bị xoá) -> trạng thái lỗi rõ ràng,
    // không dựng giao diện với dữ liệu rỗng gây hiểu nhầm.
    if (r == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Không gian review')),
        body: ErrorState(
          title: 'Không tìm thấy tài liệu',
          message: 'Yêu cầu review "$reviewId" không tồn tại hoặc đã bị xoá.',
          onRetry: () => Navigator.of(context).pop(),
        ),
      );
    }

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
              ...ReviewRepository.instance.versions(reviewId).map(_versionRow),
              const SizedBox(height: AppSpace.s),
              SizedBox(
                height: AppSpace.tapMin,
                child: OutlinedButton.icon(
                  onPressed: () =>
                      Navigator.of(context).pushNamed('/reviews/compare', arguments: reviewId),
                  icon: const Icon(Icons.compare_arrows, size: 18),
                  label: const Text('So sánh hai phiên bản'),
                ),
              ),
              const SizedBox(height: AppSpace.l),
              _sectionTitle('Chuẩn đang áp'),
              const SizedBox(height: AppSpace.s),
              SizedBox(
                height: AppSpace.tapMin,
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.of(context).pushNamed(
                    '/reviews/rule-set',
                    arguments: r.id,
                  ),
                  icon: const Icon(Icons.rule_folder_outlined, size: 18),
                  label: const Text('Xem chuẩn áp cho tài liệu này'),
                ),
              ),
              const SizedBox(height: AppSpace.l),
              _sectionTitle('Phát hiện của AI'),
              const SizedBox(height: AppSpace.s),
              _aiSummary(r),
              const SizedBox(height: AppSpace.s),
              // Đợt 14 sửa: phải lọc theo tài liệu ĐANG MỞ. Đợt 12 (§3m) tôi chỉ
              // sửa `ai_result_screen.dart` và QUÊN MẮT chỗ này, nên màn này lại
              // hiện tất cả cảnh báo toàn cục — kể cả cảnh báo không thuộc tài
              // liệu này. Bài học: sửa một triệu chứng ở một chỗ, không quét mọi
              // chỗ cùng dùng. `test/workspace_finding_scope_test.dart` chặn.
              ...ReviewRepository.instance.findings(reviewId)
                  .take(3)
                  .map((f) => AiFindingCard(finding: f)),
              const SizedBox(height: AppSpace.s),
              SizedBox(
                height: AppSpace.tapMin,
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.of(context).pushNamed(
                    '/reviews/ai-result',
                    arguments: r.id,
                  ),
                  icon: const Icon(Icons.auto_awesome_outlined, size: 18),
                  label: Text(
                      'Xem tất cả ${ReviewRepository.instance.findings(reviewId).length} phát hiện'),
                ),
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
            // `Flexible`: chip phai chiu duoc be rong hep, thieu thi `Row`
            // tran 6,3px o 320dp (do bang `flutter test`).
            // Hiện trạng thái VỪA quyết định nếu có, không thì lấy từ dữ liệu.
            Flexible(child: StatusChip.of(_decided ?? r.status)),
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
        _track(
          'AI đã review',
          1,
          Tone.olive,
          '${r.aiErrors} lỗi · ${r.aiWarnings} cảnh báo · ${r.aiSuggestions} gợi ý',
        ),
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
      // Từng là `onTap: () {}` — NÚT CHẾT. Tệ hơn nút chết thường vì khối này tự
      // khai `Semantics(button: true, label: 'Mở tài liệu ...')`: trình đọc màn
      // hình đọc lên như một nút mở được tài liệu, mà bấm không có gì xảy ra.
      // Giờ mở một sheet xem trước thật. Xem `test/dead_control_test.dart`.
      onTap: () => _showPreviewSheet(context, r),
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

  /// Thanh quyết định cố định dưới màn S04.
  ///
  /// ĐO THẬT (14/10) — chuyện này tốn nhiều lượt vì đo sai công cụ, ghi lại:
  /// hai nút render đúng **40 CSS px**, dưới ngưỡng 48 của C4. Bằng chứng cuối
  /// là đếm pixel màu brand trên ảnh chụp (`#146B55`, 80 device px ở scale 2
  /// = 40 CSS px), khớp với node semantics `width:184px; height:40px` và với
  /// vùng kích hoạt quét được (bấm dưới mép nút không mở hộp thoại).
  ///
  /// Đã thử và ĐỀU KHÔNG ĂN:
  ///   1. `outlinedButtonTheme/filledButtonTheme.minimumSize = 48` (khai từ trước)
  ///   2. `SizedBox(height: 48)` bọc ngoài `Row`
  ///   3. `SizedBox(height: 96)` bọc ngoài `Row`
  ///   4. `styleFrom(minimumSize: Size.fromHeight(48))` ngay trên nút
  /// Nguyên nhân: chiều cao từ cha truyền xuống là ràng buộc **tight**, nên
  /// `minimumSize` bị vô hiệu. Cách ăn là **SizedBox bọc TRỰC TIẾP quanh
  /// từng nút** — xem 2 chỗ `SizedBox(height: AppSpace.tapMin)` dưới đây.
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
            child: SizedBox(
              height: AppSpace.tapMin,
              child: OutlinedButton(
                onPressed: () => _confirm(
                  context,
                  title: 'Yêu cầu chỉnh sửa?',
                  message:
                      'Sinh viên sẽ nhận được yêu cầu chỉnh sửa và phải tạo '
                      'phiên bản mới. Hành động này không thu hồi được.',
                  confirmLabel: 'Gửi yêu cầu chỉnh sửa',
                  destructive: true,
                  onDone: () => _decide(
                    r.id,
                    DocStatus.needsRevision,
                    'Yêu cầu chỉnh sửa',
                    'Đã gửi yêu cầu chỉnh sửa.',
                  ),
                ),
                child: const Text('Cần chỉnh sửa'),
              ),
            ),
          ),
          const SizedBox(width: AppSpace.m),
          Expanded(
            child: SizedBox(
              height: AppSpace.tapMin,
              child: FilledButton(
                onPressed: () => _confirm(
                  context,
                  title: 'Phê duyệt tài liệu?',
                  message:
                      'Tài liệu ${r.documentTitle} ${r.version} sẽ được đánh dấu '
                      'đã phê duyệt và sinh viên có thể làm bước tiếp theo.',
                  confirmLabel: 'Phê duyệt',
                  destructive: false,
                  onDone: () => _decide(
                    r.id,
                    DocStatus.approved,
                    'Phê duyệt',
                    'Đã phê duyệt tài liệu.',
                  ),
                ),
                child: const Text('Phê duyệt'),
              ),
            ),
          ),
        ],
      ),
    ),
  );

  /// Ghi quyết định vào tầng dữ liệu RỒI mới báo cho người dùng.
  ///
  /// Ghi trước, báo sau: nếu `write` thất bại (đang offline thì nó xếp hàng và
  /// trả `false`) thì thông báo phải nói đúng là đang chờ mạng, không được nói
  /// "đã phê duyệt" khi chưa ghi được gì.
  void _decide(String id, DocStatus next, String label, String okMessage) {
    final sent = ReviewRepository.instance.write(
      id: id,
      label: label,
      payload: next.name,
    );
    setState(() => _decided = sent ? next : _decided);
    _toast(
      context,
      sent
          ? okMessage
          : 'Đang mất mạng — đã xếp hàng, sẽ gửi lại khi có mạng.',
    );
  }

  /// Sheet xem trước tài liệu.
  ///
  /// Không có backend thật nên không tải được PDF: sheet hiện đúng những gì hệ
  /// thống BIẾT về tệp (tên, phiên bản, số trang, người nộp, thời điểm) và nói
  /// rõ đây là bản demo. Không bịa nội dung trang.
  void _showPreviewSheet(BuildContext context, ReviewRequest r) {
    final fileName =
        '${r.documentTitle.toLowerCase().replaceAll(' ', '-')}-${r.version}.pdf';
    showModalBottomSheet<void>(
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
        // Dùng `DialogAction`: nút trong `AlertDialog.actions` bị ràng buộc
        // tight 40dp nên `minimumSize` của theme bị vô hiệu — đã đo được
        // 40dp trước khi sửa. `style` chỉ để đổi màu, không đặt minimumSize.
        actions: [
          DialogAction.cancel(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Huỷ'),
          ),
          DialogAction.confirm(
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
