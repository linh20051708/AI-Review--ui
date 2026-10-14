// CMPlan: tầng 011 · DASH · US02 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../../domain/entities/review_entities.dart';
import '../../shared/theme/color_tokens.dart';
import '../../shared/theme/spacing.dart';
import '../../shared/theme/typography.dart';
import '../../features/request_list/review_card.dart';
import '../../shared/widgets/offline_banner.dart';
import '../../shared/widgets/app_card.dart';
import '../../shared/widgets/status_chip.dart';
import '../../shared/widgets/tone_colors.dart';
import '../../data/repositories/review_repository.dart';

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

  // Nghe `ReviewRepository`: 4 thẻ số liệu (_pending/_inReview/_approved/
  // _needsRevision) đọc thẳng từ repository, nên sau khi phê duyệt ở màn khác
  // thì Tổng quan phải tự dựng lại. Trước 14/10 không màn nào đăng ký nghe
  // (`notifyListeners()` gọi mà không ai nhận) nên số liệu đứng im.
  @override
  void initState() {
    super.initState();
    ReviewRepository.instance.addListener(_onRepoChanged);
  }

  @override
  void dispose() {
    ReviewRepository.instance.removeListener(_onRepoChanged);
    super.dispose();
  }

  void _onRepoChanged() {
    if (mounted) setState(() {});
  }

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
      ReviewRepository.instance.requests().where((r) => r.status == DocStatus.waiting).length;

  int get _inReview =>
      ReviewRepository.instance.requests().where((r) => r.status == DocStatus.inReview).length;

  int get _approved =>
      ReviewRepository.instance.requests().where((r) => r.status == DocStatus.approved).length;

  int get _needsRevision => ReviewRepository.instance.requests()
      .where((r) => r.status == DocStatus.needsRevision)
      .length;

  int get _rejected =>
      ReviewRepository.instance.requests().where((r) => r.status == DocStatus.notAccepted).length;

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SkeletonList(count: 5);
    }

    final queue = ReviewRepository.instance.requests()
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
                // Đợt 11 sửa: `pendingCount` (số việc đang chờ mạng) chỉ nằm
                // trong repository, KHÔNG màn nào nói ra — nên người dùng nộp
                // khi mất mạng, rời màn, rồi không còn cách nào biết còn mấy
                // việc chưa gửi. Nếu tắt app tưởng đã đồng bộ là mất quyết định.
                if (ReviewRepository.instance.pendingCount > 0) ...[
                  _pendingNotice(ReviewRepository.instance.pendingCount),
                  const SizedBox(height: AppSpace.l),
                ],
                _statGrid(),
                const SizedBox(height: AppSpace.xl),
                _section(
                  title: 'Việc cần chú ý',
                  trailing: Text(
                    '${ReviewRepository.instance.attention().length} mục',
                    style: AppText.micro,
                  ),
                ),
                const SizedBox(height: AppSpace.m),
                ...ReviewRepository.instance.attention().map(_attentionTile),
                const SizedBox(height: AppSpace.xl),
                _section(
                  title: 'Hàng đợi review',
                  trailing: SizedBox(
                    height: AppSpace.tapMin,
                    child: TextButton(
                      onPressed: () =>
                          Navigator.of(context).pushNamed('/reviews'),
                      child: const Text('Xem tất cả'),
                    ),
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
                // Lối vào các màn US09/US10/US12.
                //
                // ĐO THẬT (14/10): `OutlinedButton.icon` ở đây render đúng 40dp
                // dù `outlinedButtonTheme.minimumSize` khai 48 — đo bằng
                // semantics node `role=button, flt-tappable=true,
                // getBoundingClientRect().height === 40`, không phải suy đoán.
                // Nên bọc `ConstrainedBox` ép cứng, đừng tin theme.
                _navButton('Sức khoẻ nhóm', Icons.groups_outlined,
                    () => Navigator.of(context).pushNamed('/groups/health')),
                const SizedBox(height: AppSpace.s),
                _navButton('Nộp tài liệu', Icons.upload_outlined,
                    () => Navigator.of(context).pushNamed('/submit')),
                const SizedBox(height: AppSpace.s),
                _navButton(
                    'Vì sao chưa nộp được',
                    Icons.lock_outline,
                    () => Navigator.of(context).pushNamed('/submit/why-locked')),
                const SizedBox(height: AppSpace.s),
                _navButton('Mô phỏng mất mạng', Icons.cloud_off_outlined,
                    () => setState(() => _offline = true)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Báo rõ còn mấy việc chờ mạng (đợt 11).
  ///
  /// Nói thẳng con số và hậu quả nếu tắt app: nếu không, người dùng nộp khi mất
  /// mạng xong rời màn, không còn cách nào biết còn chưa gửi — đó là lỗi "giao
  /// diện nói thiếu sự thật" (§3f/§3k): dữ liệu có, người dùng không thấy.
  Widget _pendingNotice(int count) => AppCard(
        child: Row(
          children: [
            Icon(Icons.cloud_upload_outlined,
                size: 20, color: ToneColors.fg(Tone.amber)),
            const SizedBox(width: AppSpace.m),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Còn $count việc chờ gửi',
                    style: AppText.bodySmall.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: AppSpace.xs),
                  Text(
                    'Bạn đang mất mạng nên các quyết định vừa rồi được xếp hàng. '
                    'Mở mạng lại để gửi.',
                    style: AppText.micro,
                  ),
                ],
              ),
            ),
          ],
        ),
      );

  /// Nút điều hướng đủ 48dp — KHÔNG dựa vào theme (xem ghi chú ở chỗ gọi).
  ///
  /// `AppSpace.tapMin` là hằng số 48 ở tầng 001 nên chiều cao này là ràng buộc
  /// cứng, không phải giá trị đoán.
  Widget _navButton(String label, IconData icon, VoidCallback onTap) =>
      SizedBox(
        width: double.infinity,
        height: AppSpace.tapMin,
        child: OutlinedButton.icon(
          onPressed: onTap,
          icon: Icon(icon, size: 18),
          label: Text(label),
        ),
      );

  Widget _greeting() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(ReviewRepository.instance.currentSemester.toUpperCase(), style: AppText.micro),
      const SizedBox(height: AppSpace.xs),
      Text('Chào ${ReviewRepository.instance.currentUserName}', style: AppText.pageTitle),
      const SizedBox(height: AppSpace.xs),
      Text(ReviewRepository.instance.currentUserRole, style: AppText.micro),
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
      // Thẻ "Không đạt" từng BỊ THIẾU (đợt 5): 4 thẻ cũ = 4+1+1+1 = 7, nhưng dữ
      // liệu có 8 yêu cầu. Trạng thái `notAccepted` không được thẻ nào đếm ->
      // giảng viên nhìn Tổng quan thiếu mất tài liệu đã bị trả về. Giờ đếm đủ.
      StatCard(
        label: 'Không đạt',
        value: '$_rejected',
        icon: Icons.cancel_outlined,
        tone: Tone.danger,
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
