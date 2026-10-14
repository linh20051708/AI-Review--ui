// CMPlan: tầng 011 · REVIEW · US08 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../shared/theme/color_tokens.dart';
import '../../shared/theme/spacing.dart';
import '../../shared/theme/typography.dart';
import '../../data/repositories/review_repository.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/offline_banner.dart';
import '../../domain/entities/review_entities.dart';

/// S08 — So sánh hai phiên bản trước khi quyết định (`1-UC-09`, US08).
///
/// Chọn hai phiên bản ở trên, phần dưới hiện đối chiếu từng mục.
/// Chưa có backend nên phần "khác biệt" là **mô tả do người dùng nhập ở
/// `mockData.docVersions[].note`**, không phải diff máy tính — nói rõ để
/// không hiểu nhầm là đã có tính năng so khớp tự động.
class VersionCompareScreen extends StatefulWidget {
  const VersionCompareScreen({super.key, this.reviewId});

  /// Id tài liệu đang mở (truyền từ màn chi tiết). Nếu thiếu, dùng tài liệu
  /// đầu tiên — không bao giờ rơi vào danh sách chung tĩnh (lỗi đợt 6).
  final String? reviewId;

  @override
  State<VersionCompareScreen> createState() => _VersionCompareScreenState();
}

class _VersionCompareScreenState extends State<VersionCompareScreen> {
  late final String _id = widget.reviewId ??
      ReviewRepository.instance.requests().firstOrNull?.id ??
      'review-001';
  late final List<DocVersion> _versions =
      ReviewRepository.instance.docVersions(_id);
  int _left = 0;
  int _right = 1;

  @override
  Widget build(BuildContext context) {
    if (_versions.length < 2) {
      return const EmptyState(
        title: 'Chưa đủ phiên bản để so sánh',
        message: 'Cần ít nhất 2 phiên bản của cùng một tài liệu.',
        icon: Icons.compare_outlined,
      );
    }

    final a = _versions[_left];
    final b = _versions[_right];

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        Text('Chọn hai phiên bản', style: AppText.blockTitle),
        const SizedBox(height: AppSpace.s),
        _picker('Bản cũ', _left, (i) => setState(() => _left = i)),
        const SizedBox(height: AppSpace.s),
        _picker('Bản mới', _right, (i) => setState(() => _right = i)),
        if (_left == _right) ...[
          const SizedBox(height: AppSpace.s),
          Text(
            'Hai bản đang chọn trùng nhau — chọn hai bản khác nhau để so sánh.',
            style: AppText.micro.copyWith(color: AppColors.rust),
          ),
        ],
        const SizedBox(height: AppSpace.l),
        _sideBySide(a, b),
        const SizedBox(height: AppSpace.l),
        _changes(a, b),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _picker(String label, int selected, ValueChanged<int> onPick) => AppCard(
    padding: const EdgeInsets.all(AppSpace.m),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppText.micro),
        const SizedBox(height: AppSpace.s),
        Wrap(
          spacing: AppSpace.s,
          runSpacing: AppSpace.s,
          children: [
            for (var i = 0; i < _versions.length; i++)
              _option(_versions[i].label, i == selected, () => onPick(i)),
          ],
        ),
      ],
    ),
  );

  Widget _option(String label, bool selected, VoidCallback onTap) => Semantics(
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
  );

  Widget _sideBySide(DocVersion a, DocVersion b) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Expanded(child: _versionCard(a)),
      const SizedBox(width: AppSpace.m),
      Expanded(child: _versionCard(b)),
    ],
  );

  Widget _versionCard(DocVersion v) => AppCard(
    padding: const EdgeInsets.all(AppSpace.m),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(v.label, style: AppText.sectionTitle),
        const SizedBox(height: AppSpace.xs),
        Text(v.fileName, style: AppText.micro),
        const SizedBox(height: AppSpace.s),
        Text(v.at, style: AppText.micro),
        Text(v.author, style: AppText.micro),
      ],
    ),
  );

  Widget _changes(DocVersion a, DocVersion b) => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Khác biệt giữa ${a.label} và ${b.label}',
            style: AppText.blockTitle),
        const SizedBox(height: AppSpace.s),
        _changeRow(a.label, a.note),
        const Divider(),
        _changeRow(b.label, b.note),
        const SizedBox(height: AppSpace.m),
        Text(
          'Ghi chú: đây là mô tả thay đổi do người nộp ghi lại, '
          'không phải bản so khớp từng dòng tự động.',
          style: AppText.micro,
        ),
      ],
    ),
  );

  Widget _changeRow(String label, String note) => Padding(
    padding: const EdgeInsets.symmetric(vertical: AppSpace.s),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 32,
          child: Text(label, style: AppText.label),
        ),
        const SizedBox(width: AppSpace.s),
        Expanded(child: Text(note, style: AppText.bodySmall)),
      ],
    ),
  );
}
