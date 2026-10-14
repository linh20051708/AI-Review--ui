// CMPlan: tầng 011 — mã SKU giữ nguyên; đường dẫn đã đổi theo tính năng.
import 'package:flutter/material.dart';

import '../theme/color_tokens.dart';
import '../../domain/entities/review_entities.dart';

/// Ánh xạ `Tone` (nhãn trừu tượng ở tầng 101) sang token màu (tầng 001).
///
/// Nằm ở tầng 011 vì chỉ tầng giao diện mới được phép biết màu sắc.
/// Tầng 101 giữ `Tone` thuần; tầng 001 giữ token thuần; tầng 011 nối hai cái.
class ToneColors {
  ToneColors._();

  static Color fg(Tone t) => switch (t) {
    Tone.neutral => AppColors.muted,
    Tone.olive => AppColors.olive,
    Tone.amber => AppColors.amber,
    Tone.rust => AppColors.rust,
    Tone.danger => AppColors.danger,
    Tone.brand => AppColors.brand,
  };

  static Color bg(Tone t) => switch (t) {
    Tone.neutral => AppColors.subtle,
    Tone.olive => AppColors.oliveSoft,
    Tone.amber => AppColors.amberSoft,
    Tone.rust => AppColors.rustSoft,
    Tone.danger => AppColors.dangerSoft,
    Tone.brand => AppColors.brandSoft,
  };
}
