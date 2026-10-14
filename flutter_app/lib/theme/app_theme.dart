import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'app_colors.dart';
import 'app_space.dart';
import 'app_text.dart';

/// Theme dựng từ token dự án. Không override màu bằng giá trị tự nghĩ.
///
/// Font Inter lấy từ Google Fonts — cùng nguồn với code nền React
/// (`app/src/index.css` cũng `@import` Inter từ fonts.googleapis.com).
ThemeData buildAppTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: AppColors.brand,
    brightness: Brightness.light,
  ).copyWith(
    primary: AppColors.brand,
    surface: Colors.white,
    onSurface: AppColors.ink,
    outline: AppColors.line,
    error: AppColors.danger,
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: AppColors.canvas,
    textTheme: GoogleFonts.interTextTheme(),
    appBarTheme: AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.ink,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      centerTitle: false,
      toolbarHeight: AppSpace.headerH,
      titleTextStyle: GoogleFonts.inter(textStyle: AppText.pageTitle),
    ),
    // IconButton của Material 3 mặc định chỉ 40dp -> ép lên 48dp cho đủ C4.
    iconButtonTheme: IconButtonThemeData(
      style: IconButton.styleFrom(
        minimumSize: const Size(AppSpace.tapMin, AppSpace.tapMin),
        padding: const EdgeInsets.all(AppSpace.m),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(AppSpace.tapMin),
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.buttonAll),
        textStyle: AppText.bodySmall,
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.brand,
        minimumSize: const Size.fromHeight(AppSpace.tapMin),
        side: const BorderSide(color: AppColors.line),
        shape: const RoundedRectangleBorder(borderRadius: AppRadius.buttonAll),
        textStyle: AppText.bodySmall,
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.brand,
        minimumSize: const Size(AppSpace.tapMin, AppSpace.tapMin),
        textStyle: AppText.bodySmall,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.subtle,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: AppSpace.l,
        vertical: AppSpace.m,
      ),
      border: OutlineInputBorder(
        borderRadius: AppRadius.buttonAll,
        borderSide: const BorderSide(color: AppColors.line),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: AppRadius.buttonAll,
        borderSide: const BorderSide(color: AppColors.line),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: AppRadius.buttonAll,
        borderSide: const BorderSide(color: AppColors.brand, width: 1.5),
      ),
      hintStyle: AppText.micro,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.line,
      thickness: 1,
      space: 1,
    ),
    cardTheme: const CardThemeData(
      color: Colors.white,
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      margin: EdgeInsets.zero,
    ),
  );
}
