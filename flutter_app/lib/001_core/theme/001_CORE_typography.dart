import 'package:flutter/material.dart';

import './001_CORE_color_tokens.dart';

/// Thang chữ — nguồn: `app/src/index.css` (@theme) + `DESIGN.md` §5.
/// Sàn chữ thân bài theo C4 là 14sp; `bodySmall` 13 dùng cho metadata phụ.
class AppText {
  AppText._();

  static const pageTitle = TextStyle(
    fontSize: 22,
    fontWeight: FontWeight.w700,
    color: AppColors.ink,
  );

  static const sectionTitle = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w700,
    color: AppColors.ink,
  );

  static const blockTitle = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: AppColors.ink,
  );

  static const body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: AppColors.ink,
  );

  static const bodySmall = TextStyle(
    fontSize: 13,
    fontWeight: FontWeight.w500,
    color: AppColors.ink,
  );

  static const label = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    color: AppColors.ink,
  );

  static const micro = TextStyle(
    fontSize: 11,
    fontWeight: FontWeight.w500,
    color: AppColors.muted,
  );
}
