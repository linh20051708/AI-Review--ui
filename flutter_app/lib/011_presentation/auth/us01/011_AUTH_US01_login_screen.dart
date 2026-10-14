import 'package:flutter/material.dart';

import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';

/// S01 — Đăng nhập.
///
/// Có hai đường vào: SSO trường (happy path của giảng viên) và tài khoản nội bộ
/// (đường thay thế khi SSO không khả dụng) — thoả C6 "mỗi luồng có >=1 nhánh thay thế".
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  /// Đăng nhập bằng SSO trường — không cần email/mật khẩu.
  void _submitSso() {
    setState(() {
      _error = null;
      _loading = true;
    });
    _goToDashboard();
  }

  /// Đăng nhập bằng tài khoản nội bộ — có kiểm tra hợp lệ.
  void _submit() {
    final email = _email.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Vui lòng nhập email trường.');
      return;
    }
    if (!email.contains('@')) {
      setState(() => _error = 'Email chưa đúng định dạng.');
      return;
    }
    setState(() {
      _error = null;
      _loading = true;
    });
    _goToDashboard();
  }

  /// Không có backend trong bản demo: mô phỏng độ trễ rồi vào Tổng quan.
  void _goToDashboard() {
    Future<void>.delayed(const Duration(milliseconds: 350), () {
      if (!mounted) return;
      setState(() => _loading = false);
      Navigator.of(context).pushReplacementNamed('/dashboard');
    });
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    body: SafeArea(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpace.pagePad),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _brand(),
                const SizedBox(height: AppSpace.xxl),
                Text('Đăng nhập', style: AppText.pageTitle),
                const SizedBox(height: AppSpace.xs),
                Text(
                  'Hệ thống quản lý học vụ và review tài liệu cho giảng viên',
                  style: AppText.micro,
                ),
                const SizedBox(height: AppSpace.xl),
                FilledButton.icon(
                  onPressed: _loading ? null : _submitSso,
                  icon: const Icon(Icons.school_outlined, size: 18),
                  label: const Text('Đăng nhập bằng SSO trường'),
                ),
                const SizedBox(height: AppSpace.xl),
                const _OrDivider(),
                const SizedBox(height: AppSpace.xl),
                Text('Email trường', style: AppText.label),
                const SizedBox(height: AppSpace.s),
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  style: AppText.body,
                  decoration: const InputDecoration(
                    hintText: 'an.nguyen@university.edu.vn',
                  ),
                ),
                const SizedBox(height: AppSpace.l),
                Text('Mật khẩu', style: AppText.label),
                const SizedBox(height: AppSpace.s),
                TextField(
                  controller: _password,
                  obscureText: _obscure,
                  style: AppText.body,
                  decoration: InputDecoration(
                    hintText: '••••••••',
                    suffixIcon: IconButton(
                      tooltip: _obscure ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
                      onPressed: () => setState(() => _obscure = !_obscure),
                      icon: Icon(
                        _obscure
                            ? Icons.visibility_outlined
                            : Icons.visibility_off_outlined,
                        size: 20,
                      ),
                    ),
                  ),
                ),
                if (_error != null) ...[
                  const SizedBox(height: AppSpace.m),
                  _errorBox(_error!),
                ],
                const SizedBox(height: AppSpace.xl),
                FilledButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Đăng nhập'),
                ),
                const SizedBox(height: AppSpace.l),
                TextButton(
                  onPressed: () => setState(
                    () => _error =
                        'Hãy liên hệ Phòng Đào tạo để được cấp lại mật khẩu.',
                  ),
                  child: const Text('Quên mật khẩu?'),
                ),
                const SizedBox(height: AppSpace.xl),
                Text(
                  'Demo cá nhân · PRM323 Lab 2 · ${ReviewRepository.instance.currentSemester}',
                  style: AppText.micro,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );

  Widget _brand() => Row(
    children: [
      Container(
        width: 40,
        height: 40,
        decoration: const BoxDecoration(
          color: AppColors.brand,
          borderRadius: AppRadius.buttonAll,
        ),
        child: const Icon(Icons.rate_review_outlined,
            color: Colors.white, size: 22),
      ),
      const SizedBox(width: AppSpace.m),
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Mobi Review', style: AppText.blockTitle),
            Text(
              'Academic Review Workspace',
              style: AppText.micro,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    ],
  );

  Widget _errorBox(String message) => Container(
    padding: const EdgeInsets.all(AppSpace.m),
    decoration: BoxDecoration(
      color: AppColors.dangerSoft,
      borderRadius: AppRadius.buttonAll,
      border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
    ),
    child: Row(
      children: [
        const Icon(Icons.error_outline, size: 18, color: AppColors.danger),
        const SizedBox(width: AppSpace.s),
        Expanded(
          child: Text(
            message,
            style: AppText.micro.copyWith(color: AppColors.danger),
          ),
        ),
      ],
    ),
  );
}

class _OrDivider extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) => Row(
    children: [
      const Expanded(child: Divider()),
      Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpace.m),
        child: Text('hoặc dùng tài khoản nội bộ', style: AppText.micro),
      ),
      const Expanded(child: Divider()),
    ],
  );
}
