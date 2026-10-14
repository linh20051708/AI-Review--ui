// CMPlan: tầng 011 · REVIEW · US05 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../domain/entities/review_entities.dart';
import '../../shared/theme/color_tokens.dart';
import '../../shared/theme/spacing.dart';
import '../../shared/theme/typography.dart';
import '../../shared/widgets/app_card.dart';
import '../../features/request_list/review_card.dart';
import '../../shared/widgets/offline_banner.dart';
import '../../data/repositories/review_repository.dart';

/// S05 — Kết quả đánh giá của AI.
///
/// Có bộ lọc theo mức độ và trạng thái rỗng khi bộ lọc không ra kết quả.
class AiResultScreen extends StatefulWidget {
  const AiResultScreen({super.key, required this.reviewId});

  final String reviewId;

  @override
  State<AiResultScreen> createState() => _AiResultScreenState();
}

class _AiResultScreenState extends State<AiResultScreen> {
  FindingLevel? _level;

  // Đợt 12 sửa: chỉ lấy cảnh báo THUỘC tài liệu đang mở (§3m). Trước đây
  // `findings()` không tham số trả cả 7 cảnh báo toàn cục cho mọi màn, nên chip
  // đếm "Tất cả (7)" và "Lỗi (2)" trong khi tổng luận của tài liệu lại là 2/3/4
  // — hai bộ số trên cùng một màn, không bộ nào giải thích được bộ kia.
  List<AiFinding> get _findings =>
      ReviewRepository.instance.findings(widget.reviewId);

  List<AiFinding> get _visible => _level == null
      ? _findings
      : _findings.where((f) => f.level == _level).toList();

  @override
  Widget build(BuildContext context) {
    final r = ReviewRepository.instance.byId(widget.reviewId);

    if (r == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Kết quả AI')),
        body: ErrorState(
          title: 'Không tìm thấy tài liệu',
          message: 'Không có kết quả AI cho "${widget.reviewId}".',
          onRetry: () => Navigator.of(context).pop(),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        _header(r),
        const SizedBox(height: AppSpace.l),
        _checks(),
        const SizedBox(height: AppSpace.l),
        Text('Chi tiết phát hiện', style: AppText.blockTitle),
        const SizedBox(height: AppSpace.s),
        _filterRow(),
        const SizedBox(height: AppSpace.m),
        if (_visible.isEmpty)
          const Padding(
            padding: EdgeInsets.only(top: AppSpace.xl),
            child: EmptyState(
              title: 'Không có phát hiện ở mức này',
              message: 'Chọn mức khác để xem các phát hiện còn lại.',
              icon: Icons.filter_alt_off_outlined,
            ),
          )
        else
          ..._visible.map((f) => AiFindingCard(finding: f)),
        const SizedBox(height: AppSpace.xl),
        _disclaimer(),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _header(ReviewRequest r) => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.auto_awesome_outlined,
                size: 20, color: AppColors.brand),
            const SizedBox(width: AppSpace.s),
            Text('Kết quả AI', style: AppText.micro),
          ],
        ),
        const SizedBox(height: AppSpace.m),
        Text(r.documentTitle, style: AppText.sectionTitle),
        const SizedBox(height: AppSpace.xs),
        Text(
          '${r.classCode} · ${r.groupName} · ${r.version}',
          style: AppText.micro,
        ),
        const SizedBox(height: AppSpace.l),
        Row(
          children: [
            _bigCount('${r.aiErrors}', 'Lỗi', AppColors.rust),
            const SizedBox(width: AppSpace.l),
            _bigCount('${r.aiWarnings}', 'Cảnh báo', AppColors.amber),
            const SizedBox(width: AppSpace.l),
            _bigCount('${r.aiSuggestions}', 'Gợi ý', AppColors.olive),
          ],
        ),
      ],
    ),
  );

  Widget _bigCount(String n, String label, Color color) => Expanded(
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: AppSpace.m),
      decoration: BoxDecoration(
        color: AppColors.subtle,
        borderRadius: AppRadius.buttonAll,
      ),
      child: Column(
        children: [
          Text(
            n,
            style: AppText.sectionTitle.copyWith(color: color),
          ),
          const SizedBox(height: AppSpace.xs),
          Text(label, style: AppText.micro),
        ],
      ),
    ),
  );

  Widget _checks() => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Bảng kiểm tự động', style: AppText.blockTitle),
        const SizedBox(height: AppSpace.xs),
        ...ReviewRepository.instance.checks().map((c) {
          final isLast = c == ReviewRepository.instance.checks().last;
          return Column(
            children: [
              AiCheckRow(check: c),
              if (!isLast) const Divider(),
            ],
          );
        }),
      ],
    ),
  );

  Widget _filterRow() => SizedBox(
    height: AppSpace.tapMin + 8,
    child: ListView(
      scrollDirection: Axis.horizontal,
      children: [
        _chip('Tất cả (${_findings.length})', _level == null, () {
          setState(() => _level = null);
        }),
        ...FindingLevel.values.map(
          (l) => _chip(
            '${l.label} (${_findings.where((f) => f.level == l).length})',
            _level == l,
            () => setState(() => _level = _level == l ? null : l),
          ),
        ),
      ],
    ),
  );

  Widget _chip(String label, bool selected, VoidCallback onTap) => Padding(
    padding: const EdgeInsets.only(right: AppSpace.s),
    child: Center(
      child: Semantics(
        button: true,
        selected: selected,
        label: label,
        child: InkWell(
          onTap: onTap,
          borderRadius: AppRadius.chipAll,
          child: Container(
            constraints: const BoxConstraints(
              minHeight: AppSpace.tapMin,
              minWidth: AppSpace.tapMin,
            ),
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.l),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: selected ? AppColors.brand : AppColors.subtle,
              borderRadius: AppRadius.chipAll,
              border: Border.all(
                color: selected ? AppColors.brand : AppColors.line,
              ),
            ),
            child: Text(
              label,
              style: AppText.label.copyWith(
                color: selected ? Colors.white : AppColors.muted,
              ),
            ),
          ),
        ),
      ),
    ),
  );

  Widget _disclaimer() => Container(
    padding: const EdgeInsets.all(AppSpace.m),
    decoration: const BoxDecoration(
      color: AppColors.brandTint,
      borderRadius: AppRadius.buttonAll,
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.info_outline, size: 18, color: AppColors.brand),
        const SizedBox(width: AppSpace.s),
        Expanded(
          child: Text(
            'Kết quả AI chỉ mang tính hỗ trợ. Quyết định cuối cùng luôn thuộc về '
            'giảng viên — mọi phát hiện đều cần được xem lại trước khi gửi phản hồi.',
            style: AppText.micro,
          ),
        ),
      ],
    ),
  );
}
