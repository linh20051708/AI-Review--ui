// CMPlan: tầng 011 · REVIEW · US04 — mã SKU giữ nguyên; chia theo page -> state -> widget.
import 'package:flutter/material.dart';

import '../../../shared/theme/color_tokens.dart';
import '../../../shared/theme/spacing.dart';
import '../../../shared/theme/typography.dart';

/// S04 — Một dòng trong "Lịch sử phiên bản" (`1-UC-06`, US04).
///
/// Dữ liệu là record do `ReviewRepository.versions()` trả về — giữ nguyên kiểu
/// đó ở ranh giới để không phải dựng thêm lớp trung gian chỉ để tách tệp.
class WorkspaceVersionRow extends StatelessWidget {
  const WorkspaceVersionRow({super.key, required this.version});

  final ({String version, String fileName, String at, String status}) version;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpace.s),
      child: Row(
        children: [
          Container(
            constraints: const BoxConstraints(minWidth: AppSpace.tapMin, minHeight: 24),
            padding: const EdgeInsets.symmetric(horizontal: AppSpace.s),
            alignment: Alignment.center,
            decoration: const BoxDecoration(
              color: AppColors.subtle,
              borderRadius: AppRadius.chipAll,
            ),
            child: Text(version.version, style: AppText.label),
          ),
          const SizedBox(width: AppSpace.m),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(version.fileName, style: AppText.bodySmall),
                Text('${version.at} · ${version.status}', style: AppText.micro),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
