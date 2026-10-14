import 'package:flutter/material.dart';

import '../data/demo_data.dart';
import '../data/models.dart';
import '../theme/app_colors.dart';
import '../theme/app_space.dart';
import '../theme/app_text.dart';
import '../widgets/review_card.dart';
import '../widgets/states.dart';
import '../widgets/status_chip.dart';

/// S02 — Tổng quan.
///
/// Có 3 trạng thái: thường · đang tải (khung xương) · mất mạng (băng cảnh báo).
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _loading = false;
  bool _offline = false;

  void _simulateReload() {
    setState(() => _loading = true);
    Future<void>.delayed(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _offline = false;
      });
    });
  }

  int get _pending =>
      DemoData.reviewRequests.where((r) => r.status == DocStatus.waiting).length;

  int get _inReview =>
      DemoData.reviewRequests.where((r) => r.status == DocStatus.inReview).length;

  int get _approved =>
      DemoData.reviewRequests.where((r) => r.status == DocStatus.approved).length;

  int get _needsRevision => DemoData.reviewRequests
      .where((r) => r.status == DocStatus.needsRevision)
      .length;

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SkeletonList(count: 5);
    }

    final queue = DemoData.reviewRequests
        .where((r) => r.status == DocStatus.waiting || r.status == DocStatus.inReview)
        .take(3)
        .toList();

    return Column(
      children: [
        if (_offline) OfflineBanner(onRetry: _simulateReload),
        Expanded(
          child: RefreshIndicator(
            onRefresh: () async => _simulateReload(),
            child: ListView(
              padding: const EdgeInsets.all(AppSpace.pagePad),
              children: [
                _greeting(),
                const SizedBox(height: AppSpace.xl),
                _statGrid(),
                const SizedBox(height: AppSpace.xl),
                _section(
                  title: 'Việc cần chú ý',
                  trailing: Text(
                    '${DemoData.attentionItems.length} mục',
                    style: AppText.micro,
                  ),
                ),
                const SizedBox(height: AppSpace.m),
                ...DemoData.attentionItems.map(_attentionTile),
                const SizedBox(height: AppSpace.xl),
                _section(
                  title: 'Hàng đợi review',
                  trailing: TextButton(
                    onPressed: () =>
                        Navigator.of(context).pushNamed('/reviews'),
                    child: const Text('Xem tất cả'),
                  ),
                ),
                const SizedBox(height: AppSpace.s),
                ...queue.map(
                  (r) => ReviewCard(
                    item: r,
                    onTap: () => Navigator.of(context)
                        .pushNamed('/reviews/detail', arguments: r.id),
                  ),
                ),
                const SizedBox(height: AppSpace.xl),
                OutlinedButton.icon(
                  onPressed: () => setState(() => _offline = true),
                  icon: const Icon(Icons.cloud_off_outlined, size: 18),
                  label: const Text('Mô phỏng mất mạng'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _greeting() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(DemoData.currentSemester.toUpperCase(), style: AppText.micro),
      const SizedBox(height: AppSpace.xs),
      Text('Chào ${DemoData.currentUserName}', style: AppText.pageTitle),
      const SizedBox(height: AppSpace.xs),
      Text(DemoData.currentUserRole, style: AppText.micro),
    ],
  );

  Widget _statGrid() => GridView.count(
    crossAxisCount: 2,
    shrinkWrap: true,
    physics: const NeverScrollableScrollPhysics(),
    mainAxisSpacing: AppSpace.l,
    crossAxisSpacing: AppSpace.l,
    childAspectRatio: 1.6,
    children: [
      StatCard(
        label: 'Chờ bạn review',
        value: '$_pending',
        icon: Icons.pending_actions_outlined,
        tone: Tone.amber,
        onTap: () => Navigator.of(context).pushNamed('/reviews'),
      ),
      StatCard(
        label: 'Đang review',
        value: '$_inReview',
        icon: Icons.rate_review_outlined,
        tone: Tone.brand,
        onTap: () => Navigator.of(context).pushNamed('/reviews'),
      ),
      StatCard(
        label: 'Đã phê duyệt',
        value: '$_approved',
        icon: Icons.verified_outlined,
        tone: Tone.olive,
        onTap: () => Navigator.of(context).pushNamed('/reviews'),
      ),
      StatCard(
        label: 'Cần chỉnh sửa',
        value: '$_needsRevision',
        icon: Icons.edit_note_outlined,
        tone: Tone.rust,
        onTap: () => Navigator.of(context).pushNamed('/reviews'),
      ),
    ],
  );

  Widget _section({required String title, Widget? trailing}) => Row(
    children: [
      Expanded(
        child: Text(
          title,
          style: AppText.sectionTitle,
          overflow: TextOverflow.ellipsis,
        ),
      ),
      const SizedBox(width: AppSpace.s),
      ?trailing,
    ],
  );

  Widget _attentionTile(AttentionItem item) => Container(
    margin: const EdgeInsets.only(bottom: AppSpace.s),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: AppRadius.cardAll,
      border: Border.all(color: AppColors.line),
    ),
    clipBehavior: Clip.antiAlias,
    child: Semantics(
      button: true,
      label: '${item.title}. ${item.meta}',
      child: InkWell(
        onTap: () => Navigator.of(context)
            .pushNamed('/reviews/detail', arguments: item.reviewId),
        child: Padding(
          padding: const EdgeInsets.all(AppSpace.m),
          child: Row(
            children: [
              Container(
                width: 4,
                height: 36,
                decoration: BoxDecoration(
                  color: ToneColors.fg(item.tone),
                  borderRadius: AppRadius.chipAll,
                ),
              ),
              const SizedBox(width: AppSpace.m),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.title, style: AppText.bodySmall),
                    const SizedBox(height: AppSpace.xs),
                    Text(item.meta, style: AppText.micro),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right,
                  size: 20, color: AppColors.muted),
            ],
          ),
        ),
      ),
    ),
  );
}
