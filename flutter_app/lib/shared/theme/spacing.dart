// CMPlan: tầng 001 — mã SKU giữ nguyên dù đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

/// Khoảng cách + bán kính — nguồn: `app/src/index.css` (@theme) + `DESIGN.md` §5.
class AppSpace {
  AppSpace._();

  static const double xs = 4.0;
  static const double s = 8.0;
  static const double m = 12.0;
  static const double l = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;
  static const double huge = 48.0;

  static const double pagePad = 20.0;

  /// Vùng bấm tối thiểu — C4 / WCAG 2.5.8 / Material 3: >= 48x48 dp.
  static const double tapMin = 48.0;

  static const double headerH = 56.0;
  static const double navH = 64.0;
}

class AppRadius {
  AppRadius._();

  static const double chip = 6.0;
  static const double button = 8.0;
  static const double card = 12.0;
  static const double dialog = 16.0;

  static const BorderRadius chipAll = BorderRadius.all(Radius.circular(chip));
  static const BorderRadius buttonAll =
      BorderRadius.all(Radius.circular(button));
  static const BorderRadius cardAll = BorderRadius.all(Radius.circular(card));
  static const BorderRadius dialogAll =
      BorderRadius.all(Radius.circular(dialog));
}
