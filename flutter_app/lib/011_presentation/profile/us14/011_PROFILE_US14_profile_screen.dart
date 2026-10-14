import 'package:flutter/material.dart';

import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';
import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_shared_status_chip.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';

/// S06 — Hồ sơ giảng viên.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(AppSpace.pagePad),
    children: [
      _identity(),
      const SizedBox(height: AppSpace.l),
      _stats(),
      const SizedBox(height: AppSpace.l),
      _section('Tài khoản'),
      _row(context, Icons.badge_outlined, 'Mã giảng viên', 'GV-SE-0142'),
      _row(context, Icons.mail_outline, 'Email', ReviewRepository.instance.currentUserEmail),
      _row(
        context,
        Icons.school_outlined,
        'Đơn vị',
        'Khoa Công nghệ Phần mềm',
      ),
      _row(context, Icons.calendar_today_outlined, 'Học kỳ',
          ReviewRepository.instance.currentSemester),
      const SizedBox(height: AppSpace.l),
      _section('Tuỳ chọn review'),
      _toggle('Tự động tải kết quả AI', true),
      _toggle('Nhắc khi tài liệu chờ quá 72 giờ', true),
      _toggle('Gửi phản hồi theo mẫu có sẵn', false),
      const SizedBox(height: AppSpace.l),
      _section('Phiên làm việc'),
      OutlinedButton.icon(
        onPressed: () {
          Navigator.of(context).pushNamedAndRemoveUntil('/login', (_) => false);
        },
        icon: const Icon(Icons.logout, size: 18),
        label: const Text('Đăng xuất'),
      ),
      const SizedBox(height: AppSpace.xl),
      Text(
        'PRM323 · Lab 2 · Bản demo handoff Flutter',
        style: AppText.micro,
        textAlign: TextAlign.center,
      ),
    ],
  );

  Widget _identity() => AppCard(
    child: Row(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: const BoxDecoration(
            color: AppColors.brandSoft,
            shape: BoxShape.circle,
          ),
          alignment: Alignment.center,
          child: Text(
            ReviewRepository.instance.currentUserInitials,
            style: AppText.blockTitle.copyWith(color: AppColors.brand),
          ),
        ),
        const SizedBox(width: AppSpace.l),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(ReviewRepository.instance.currentUserName, style: AppText.blockTitle),
              const SizedBox(height: AppSpace.xs),
              Text(ReviewRepository.instance.currentUserRole, style: AppText.micro),
              const SizedBox(height: AppSpace.s),
              const StatusChip(
                label: 'Đang hoạt động',
                tone: Tone.brand,
                icon: Icons.check_circle_outline,
              ),
            ],
          ),
        ),
      ],
    ),
  );

  Widget _stats() {
    final pending = ReviewRepository.instance.requests()
        .where((r) => r.status == DocStatus.waiting)
        .length;
    final approved = ReviewRepository.instance.requests()
        .where((r) => r.status == DocStatus.approved)
        .length;

    return Row(
      children: [
        Expanded(
          child: StatCard(
            label: 'Chờ review',
            value: '$pending',
            icon: Icons.pending_actions_outlined,
            tone: Tone.amber,
          ),
        ),
        const SizedBox(width: AppSpace.l),
        Expanded(
          child: StatCard(
            label: 'Đã duyệt',
            value: '$approved',
            icon: Icons.verified_outlined,
            tone: Tone.olive,
          ),
        ),
      ],
    );
  }

  Widget _section(String t) => Padding(
    padding: const EdgeInsets.only(bottom: AppSpace.s),
    child: Text(t, style: AppText.blockTitle),
  );

  Widget _row(BuildContext context, IconData icon, String k, String v) =>
      Container(
        margin: const EdgeInsets.only(bottom: AppSpace.s),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpace.l,
          vertical: AppSpace.m,
        ),
        constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadius.buttonAll,
          border: Border.all(color: AppColors.line),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.muted),
            const SizedBox(width: AppSpace.m),
            Expanded(child: Text(k, style: AppText.bodySmall)),
            Text(v, style: AppText.micro),
          ],
        ),
      );

  Widget _toggle(String label, bool value) => Container(
    margin: const EdgeInsets.only(bottom: AppSpace.s),
    padding: const EdgeInsets.symmetric(horizontal: AppSpace.l),
    constraints: const BoxConstraints(minHeight: AppSpace.tapMin + 8),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: AppRadius.buttonAll,
      border: Border.all(color: AppColors.line),
    ),
    child: Row(
      children: [
        Expanded(
          child: Text(label, style: AppText.bodySmall),
        ),
        // Switch của Material 3 đã có đích chạm >= 48dp theo mặc định.
        Switch(value: value, onChanged: (_) {}),
      ],
    ),
  );
}
