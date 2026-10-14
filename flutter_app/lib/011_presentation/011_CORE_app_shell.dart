import 'package:flutter/material.dart';

import '../001_core/theme/001_CORE_color_tokens.dart';
import '../001_core/theme/001_CORE_spacing.dart';
import '../001_core/theme/001_CORE_typography.dart';
import './shared/011_CORE_shared_app_card.dart';
import './dashboard/us02/011_DASH_US02_dashboard_screen.dart';
import './profile/us14/011_PROFILE_US14_profile_screen.dart';
import './review/us03/011_REVIEW_US03_request_list_screen.dart';
import './shared/011_CORE_tone_colors.dart';
import '../202_data_repositories/202_DOMAIN_review_repository.dart';

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

  static const _titles = ['Tổng quan', 'Yêu cầu review', 'Thông báo', 'Hồ sơ'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_titles[_index]),
        actions: [
          IconButton(
            tooltip: 'Tìm kiếm',
            onPressed: () {},
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
        1 => const ReviewListScreen(),
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
