import 'package:flutter/material.dart';

import '../../001_core/theme/001_CORE_color_tokens.dart';
import '../../101_domain_entities/101_DOMAIN_review_entities.dart';

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
