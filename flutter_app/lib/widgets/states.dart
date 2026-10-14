import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_space.dart';
import '../theme/app_text.dart';

/// Trạng thái rỗng — có tiêu đề, giải thích và một hành động để không thành ngõ cụt.
class EmptyState extends StatelessWidget {
  const EmptyState({
    super.key,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.icon = Icons.inbox_outlined,
  });

  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              color: AppColors.subtle,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 28, color: AppColors.muted),
          ),
          const SizedBox(height: AppSpace.l),
          Text(title, style: AppText.blockTitle, textAlign: TextAlign.center),
          const SizedBox(height: AppSpace.s),
          Text(message, style: AppText.micro, textAlign: TextAlign.center),
          if (actionLabel != null && onAction != null) ...[
            const SizedBox(height: AppSpace.xl),
            OutlinedButton(onPressed: onAction, child: Text(actionLabel!)),
          ],
        ],
      ),
    ),
  );
}

/// Băng cảnh báo mất mạng — có nút thử lại.
class OfflineBanner extends StatelessWidget {
  const OfflineBanner({super.key, required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(
      horizontal: AppSpace.l,
      vertical: AppSpace.s,
    ),
    decoration: const BoxDecoration(
      color: AppColors.amberSoft,
      border: Border(bottom: BorderSide(color: AppColors.line)),
    ),
    child: Row(
      children: [
        const Icon(Icons.cloud_off_outlined, size: 18, color: AppColors.amber),
        const SizedBox(width: AppSpace.s),
        Expanded(
          child: Text(
            'Không có kết nối mạng. Đang hiển thị dữ liệu đã tải.',
            style: AppText.micro.copyWith(color: AppColors.amber),
          ),
        ),
        TextButton(onPressed: onRetry, child: const Text('Thử lại')),
      ],
    ),
  );
}

/// Khung xương khi đang tải.
class SkeletonBox extends StatelessWidget {
  const SkeletonBox({super.key, this.height = 16, this.width = double.infinity});

  final double height;
  final double width;

  @override
  Widget build(BuildContext context) => Container(
    width: width,
    height: height,
    decoration: BoxDecoration(
      color: AppColors.subtle,
      borderRadius: AppRadius.chipAll,
    ),
  );
}

/// Danh sách khung xương cho màn Yêu cầu review.
class SkeletonList extends StatelessWidget {
  const SkeletonList({super.key, this.count = 4});

  final int count;

  @override
  Widget build(BuildContext context) => ListView.separated(
    padding: const EdgeInsets.all(AppSpace.pagePad),
    itemCount: count,
    separatorBuilder: (_, _) => const SizedBox(height: AppSpace.m),
    itemBuilder: (_, _) => Container(
      padding: const EdgeInsets.all(AppSpace.l),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadius.cardAll,
        border: Border.all(color: AppColors.line),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonBox(height: 11, width: 96),
          SizedBox(height: AppSpace.s),
          SkeletonBox(height: 16, width: 220),
          SizedBox(height: AppSpace.m),
          SkeletonBox(height: 11, width: 140),
        ],
      ),
    ),
  );
}

/// Trạng thái lỗi — luôn kèm đường thoát.
class ErrorState extends StatelessWidget {
  const ErrorState({
    super.key,
    required this.title,
    required this.message,
    required this.onRetry,
  });

  final String title;
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(AppSpace.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: const BoxDecoration(
              color: AppColors.dangerSoft,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.error_outline,
              size: 28,
              color: AppColors.danger,
            ),
          ),
          const SizedBox(height: AppSpace.l),
          Text(title, style: AppText.blockTitle, textAlign: TextAlign.center),
          const SizedBox(height: AppSpace.s),
          Text(message, style: AppText.micro, textAlign: TextAlign.center),
          const SizedBox(height: AppSpace.xl),
          FilledButton(onPressed: onRetry, child: const Text('Thử lại')),
        ],
      ),
    ),
  );
}
