import 'package:flutter/material.dart';

import '../data/demo_data.dart';
import '../data/models.dart';
import '../theme/app_colors.dart';
import '../theme/app_space.dart';
import '../theme/app_text.dart';
import '../widgets/review_card.dart';
import '../widgets/states.dart';

/// S03 — Yêu cầu review.
///
/// 4 trạng thái: thường · đang tải · rỗng (lọc không ra kết quả) · lỗi.
class ReviewListScreen extends StatefulWidget {
  const ReviewListScreen({super.key});

  @override
  State<ReviewListScreen> createState() => _ReviewListScreenState();
}

class _ReviewListScreenState extends State<ReviewListScreen> {
  final _query = TextEditingController();
  String _keyword = '';
  DocStatus? _filter;
  final bool _loading = false;
  bool _hasError = false;

  static const _filters = <DocStatus>[
    DocStatus.waiting,
    DocStatus.inReview,
    DocStatus.needsRevision,
    DocStatus.approved,
  ];

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  List<ReviewRequest> get _visible {
    final k = _keyword.toLowerCase();
    return DemoData.reviewRequests.where((r) {
      if (_filter != null && r.status != _filter) return false;
      if (k.isEmpty) return true;
      return r.documentTitle.toLowerCase().contains(k) ||
          r.projectName.toLowerCase().contains(k) ||
          r.groupName.toLowerCase().contains(k) ||
          r.submitter.toLowerCase().contains(k);
    }).toList();
  }

  @override
  Widget build(BuildContext context) => Column(
    children: [
      _searchBar(),
      if (_loading)
        const Expanded(child: SkeletonList())
      else if (_hasError)
        Expanded(
          child: ErrorState(
            title: 'Không tải được danh sách',
            message: 'Máy chủ không phản hồi. Kiểm tra kết nối rồi thử lại.',
            onRetry: () => setState(() => _hasError = false),
          ),
        )
      else
        Expanded(child: _body()),
    ],
  );

  Widget _searchBar() => Container(
    padding: const EdgeInsets.fromLTRB(
      AppSpace.pagePad,
      AppSpace.m,
      AppSpace.pagePad,
      AppSpace.s,
    ),
    color: Colors.white,
    child: Column(
      children: [
        TextField(
          controller: _query,
          style: AppText.body,
          onChanged: (v) => setState(() => _keyword = v),
          decoration: InputDecoration(
            hintText: 'Tìm theo tài liệu, dự án, nhóm, người nộp',
            prefixIcon: const Icon(Icons.search, size: 20),
            suffixIcon: _keyword.isEmpty
                ? null
                : IconButton(
                    tooltip: 'Xoá tìm kiếm',
                    icon: const Icon(Icons.close, size: 18),
                    onPressed: () {
                      _query.clear();
                      setState(() => _keyword = '');
                    },
                  ),
          ),
        ),
        const SizedBox(height: AppSpace.s),
        SizedBox(
          height: AppSpace.tapMin + 8,
          child: ListView(
            scrollDirection: Axis.horizontal,
            children: [
              _chip('Tất cả', _filter == null, () {
                setState(() => _filter = null);
              }),
              ..._filters.map(
                (s) => _chip(s.label, _filter == s, () {
                  setState(() => _filter = _filter == s ? null : s);
                }),
              ),
            ],
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
            // Đích chạm >= 48dp cả hai chiều (C4).
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

  Widget _body() {
    final items = _visible;

    if (items.isEmpty) {
      return EmptyState(
        title: 'Không có yêu cầu nào khớp',
        message: _keyword.isEmpty
            ? 'Chưa có tài liệu nào ở trạng thái này.'
            : 'Không tìm thấy kết quả cho "$_keyword". Thử từ khoá khác.',
        actionLabel: 'Xoá bộ lọc',
        onAction: () => setState(() {
          _query.clear();
          _keyword = '';
          _filter = null;
        }),
        icon: Icons.search_off_outlined,
      );
    }

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        Row(
          children: [
            Text('${items.length} yêu cầu', style: AppText.micro),
            const Spacer(),
            TextButton.icon(
              onPressed: () => setState(() => _hasError = true),
              icon: const Icon(Icons.error_outline, size: 16),
              label: const Text('Mô phỏng lỗi'),
            ),
          ],
        ),
        const SizedBox(height: AppSpace.s),
        ...items.map(
          (r) => ReviewCard(
            item: r,
            onTap: () => Navigator.of(context)
                .pushNamed('/reviews/detail', arguments: r.id),
          ),
        ),
      ],
    );
  }
}
