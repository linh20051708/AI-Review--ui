// CMPlan: tầng 011 — mã SKU giữ nguyên dù đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../shared/theme/color_tokens.dart';
import '../shared/theme/spacing.dart';
import '../shared/theme/typography.dart';
import '../shared/widgets/app_card.dart';
import '../features/dashboard/dashboard_screen.dart';
import '../features/profile/profile_screen.dart';
import '../features/request_list/request_list_screen.dart';
import '../shared/widgets/tone_colors.dart';
import '../data/repositories/review_repository.dart';

/// Khung 4 tab dùng chung: Tổng quan · Review · Thông báo · Hồ sơ.
///
/// Thanh điều hướng cao 64dp, mỗi mục >= 48dp — đạt C4.
class AppShell extends StatefulWidget {
  const AppShell({super.key, this.initialIndex = 0});

  final int initialIndex;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  late int _index = widget.initialIndex;

  /// "Vé" báo cho `ReviewListScreen` focus ô tìm kiếm. Tăng lên mỗi lần bấm nút
  /// `Tìm kiếm` ở thanh tiêu đề.
  int _searchToken = 0;

  static const _titles = ['Tổng quan', 'Yêu cầu review', 'Thông báo', 'Hồ sơ'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index]),
        actions: [
          // Nút này từng là `onPressed: () {}` — NÚT CHẾT, có mặt ở mọi màn mà
          // bấm không làm gì. Không có màn tìm kiếm toàn cục, nên hành động
          // đúng nghĩa là đưa người dùng tới chỗ tìm được: tab Review, và focus
          // thẳng vào ô tìm kiếm ở đó. Xem `test/dead_control_test.dart`.
          IconButton(
            tooltip: 'Tìm kiếm',
            onPressed: () => setState(() {
              _index = 1;
              _searchToken++;
            }),
            icon: const Icon(Icons.search, size: 22),
          ),
          IconButton(
            tooltip: 'Hồ sơ',
            onPressed: () => setState(() => _index = 3),
            icon: const Icon(Icons.person_outline, size: 22),
          ),
          const SizedBox(width: AppSpace.s),
        ],
      ),
      body: switch (_index) {
        0 => const DashboardScreen(),
        1 => ReviewListScreen(focusSearchToken: _searchToken),
        2 => const _NotificationsTab(),
        _ => const ProfileScreen(),
      },
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppColors.line)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: AppSpace.navH,
            child: Row(
              children: [
                _navItem(0, Icons.dashboard_outlined, 'Tổng quan'),
                _navItem(1, Icons.fact_check_outlined, 'Review'),
                _navItem(2, Icons.notifications_none, 'Thông báo'),
                _navItem(3, Icons.person_outline, 'Hồ sơ'),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem(int i, IconData icon, String label) {
    final selected = _index == i;
    final color = selected ? AppColors.brand : AppColors.muted;

    return Expanded(
      child: Semantics(
        button: true,
        selected: selected,
        label: label,
        child: InkWell(
          onTap: () => setState(() => _index = i),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 22, color: color),
              const SizedBox(height: AppSpace.xs),
              Text(
                label,
                style: AppText.micro.copyWith(
                  color: color,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Tab Thông báo — dữ liệu suy từ hàng đợi review, không bịa thêm.
class _NotificationsTab extends StatelessWidget {
  const _NotificationsTab();

  @override
  Widget build(BuildContext context) {
    final items = ReviewRepository.instance.requests()
        .where((r) => r.note != null)
        .map(
          (r) => (
            title: '${r.groupName} · ${r.documentTitle} ${r.version}',
            body: r.note!,
            tone: r.status.tone,
            reviewId: r.id,
          ),
        )
        .toList();

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        Text('${items.length} thông báo', style: AppText.micro),
        const SizedBox(height: AppSpace.m),
        ...items.map(
          (n) => AppCard(
            margin: const EdgeInsets.only(bottom: AppSpace.s),
            onTap: () => Navigator.of(context)
                .pushNamed('/reviews/detail', arguments: n.reviewId),
            semanticLabel: '${n.title}. ${n.body}',
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 4,
                  height: 32,
                  decoration: BoxDecoration(
                    color: ToneColors.fg(n.tone),
                    borderRadius: AppRadius.chipAll,
                  ),
                ),
                const SizedBox(width: AppSpace.m),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(n.title, style: AppText.bodySmall),
                      const SizedBox(height: AppSpace.xs),
                      Text(n.body, style: AppText.micro),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
