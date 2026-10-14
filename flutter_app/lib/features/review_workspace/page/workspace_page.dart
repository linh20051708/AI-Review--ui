// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../domain/entities/review_entities.dart';
import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';
import '../../../shared/widgets/offline_banner.dart';
import '../../../data/repositories/review_repository.dart';
import '../../request_list/review_card.dart';
import '../state/workspace_state.dart';
import '../widget/workspace_ai_summary_card.dart';
import '../widget/workspace_attachment_card.dart';
import '../widget/workspace_decision_bar.dart';
import '../widget/workspace_doc_card.dart';
import '../widget/workspace_preview_sheet.dart';
import '../widget/workspace_track_card.dart';
import '../widget/workspace_version_row.dart';

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

    // Page chỉ điều phối: nội dung tách thành widget trong `widget/`, trạng
    // thái "vừa quyết định gì" cho xuống `state/` để thẻ tài liệu đổi chip.
    return WorkspaceState(
      decided: _decided,
      review: r,
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(AppSpace.pagePad),
              children: [
                const WorkspaceDocCard(),
                const SizedBox(height: AppSpace.l),
                WorkspaceTrackCard(review: r),
                const SizedBox(height: AppSpace.l),
                _sectionTitle('Tệp đính kèm'),
                const SizedBox(height: AppSpace.s),
                WorkspaceAttachmentCard(
                  review: r,
                  onOpenPreview: () => showWorkspacePreviewSheet(context, r),
                ),
                const SizedBox(height: AppSpace.l),
                _sectionTitle('Lịch sử phiên bản'),
                const SizedBox(height: AppSpace.s),
                ...ReviewRepository.instance.versions(reviewId).map(
                  (v) => WorkspaceVersionRow(version: v),
                ),
                const SizedBox(height: AppSpace.s),
                SizedBox(
                  height: AppSpace.tapMin,
                  child: OutlinedButton.icon(
                    onPressed: () => Navigator.of(context).pushNamed(
                      '/reviews/compare',
                      arguments: reviewId,
                    ),
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
                WorkspaceAiSummaryCard(review: r),
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
          WorkspaceDecisionBar(review: r, onDecide: _decide),
        ],
      ),
    );
  }

  Widget _sectionTitle(String t) => Text(t, style: AppText.blockTitle);

  void _decide(String id, DocStatus next, String label, String okMessage) {
    final sent = ReviewRepository.instance.write(
      id: id,
      label: label,
      payload: next.name,
    );
    setState(() => _decided = sent ? next : _decided);
    _toast(context, sent ? okMessage : 'Đang mất mạng — đã xếp hàng, sẽ gửi lại khi có mạng.');
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
}
