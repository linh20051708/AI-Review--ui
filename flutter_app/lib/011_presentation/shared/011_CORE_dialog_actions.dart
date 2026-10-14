import 'package:flutter/material.dart';

import '../../001_core/theme/001_CORE_spacing.dart';

/// Nút hành động cho `AlertDialog`, **bảo đảm đủ 48dp** (Chuẩn chung C4).
///
/// VÌ SAO CẦN RIÊNG MỘT WIDGET:
/// `AlertDialog.actions` đặt các nút vào một `OverflowBar`, và ở đó ràng buộc
/// chiều cao là **tight 40dp** — đúng bằng mặc định Material cho nút trong
/// hộp thoại. Ràng buộc tight **vô hiệu hoá** `minimumSize` khai trong
/// `filledButtonTheme`/`textButtonTheme` (`001_CORE_app_theme.dart`), nên nút
/// trong hộp thoại co về **40dp dù theme đã khai 48**.
///
/// ĐÃ ĐO THẬT (Chromium, bản release, viewport 412×892):
///   - hỏi trước khi sửa: `Huỷ` **46,6×40**, `Phê duyệt` **284×40**  → vi phạm C4
///   - sau khi bọc `SizedBox(height: tapMin)`: cả hai đạt 48
///
/// Cách sửa duy nhất đã kiểm chứng là ăn: bọc `SizedBox(height: AppSpace.tapMin)`
/// **trực tiếp quanh từng nút**. Bốn cách sau đều KHÔNG ăn, ghi lại để không ai
/// đi lại: (1) `minimumSize` trong theme; (2) `SizedBox` bọc ngoài `Row`;
/// (3) nới `SizedBox` lên 96; (4) `styleFrom(minimumSize:)` ngay trên nút.
///
/// LỖ HỔNG ĐÃ TỪNG BỊ BỎ SÓT: `verify/flutter-tap-targets.mjs` chỉ quét nút ở
/// tầng màn hình, **không quét nút bên trong hộp thoại** (hộp thoại là trạng
/// thái tạm, chỉ hiện sau khi bấm). Vì vậy 12 nút ngoài màn hình đã được sửa
/// đúng 48dp mà 2 nút trong hộp thoại vẫn 40dp. Dùng widget này để chỗ sửa
/// không phụ thuộc vào việc có ai đó nhớ ra hay không.
class DialogAction extends StatelessWidget {
  /// Nút phụ (huỷ / đóng) — dùng `TextButton`.
  const DialogAction.cancel({
    super.key,
    required this.child,
    required this.onPressed,
  }) : filled = false,
       style = null;

  /// Nút chính (xác nhận) — dùng `FilledButton`.
  ///
  /// `style` chỉ để đổi MÀU (ví dụ `destructive` dùng `AppColors.rust`).
  /// KHÔNG truyền `minimumSize` qua đây — nó sẽ bị ràng buộc tight của
  /// `AlertDialog.actions` vô hiệu, đúng cái bẫy đã đo được.
  const DialogAction.confirm({
    super.key,
    required this.child,
    required this.onPressed,
    this.style,
  }) : filled = true;

  final Widget child;
  final VoidCallback onPressed;
  final bool filled;
  final ButtonStyle? style;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: AppSpace.tapMin,
    child: filled
        ? FilledButton(onPressed: onPressed, style: style, child: child)
        : TextButton(onPressed: onPressed, style: style, child: child),
  );
}
