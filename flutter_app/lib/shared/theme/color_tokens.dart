// CMPlan: tầng 001 — mã SKU giữ nguyên dù đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

/// Token màu — nguồn: `app/src/index.css` (@theme) của code nền do giảng viên cung cấp.
/// Không tự đặt giá trị mới; mọi hằng số ở đây truy được về CSS gốc.
class AppColors {
  AppColors._();

  // Thương hiệu
  static const brand = Color(0xFF146B55);
  static const brandSoft = Color(0xFFEAF4ED);
  static const brandTint = Color(0xFFF2F7F3);

  // Chữ
  static const ink = Color(0xFF24332D);
  static const muted = Color(0xFF66736D);

  // Viền & nền
  static const line = Color(0xFFE1E7E3);
  static const canvas = Color(0xFFFAFBFA);
  static const subtle = Color(0xFFF7F9F7);

  // Trạng thái
  static const olive = Color(0xFF637344);
  static const oliveSoft = Color(0xFFF1F4E9);
  static const amber = Color(0xFF756534);
  static const amberSoft = Color(0xFFF5F2E7);
  static const rust = Color(0xFFA65335);
  static const rustSoft = Color(0xFFFBF0EA);
  static const danger = Color(0xFFA34343);
  static const dangerSoft = Color(0xFFFAEEEE);
}
