import 'package:flutter/material.dart';

import '../../../001_core/theme/001_CORE_color_tokens.dart';
import '../../../001_core/theme/001_CORE_spacing.dart';
import '../../../001_core/theme/001_CORE_typography.dart';
import '../../../202_data_repositories/202_DOMAIN_review_repository.dart';
import '../../shared/011_CORE_shared_app_card.dart';
import '../../shared/011_CORE_shared_status_chip.dart';
import '../../shared/011_CORE_US11_offline_banner.dart';
import '../../../101_domain_entities/101_DOMAIN_review_entities.dart';

/// S09 — Nộp tài liệu cho nhóm và **biết đã nộp chưa** (`1-UC-10`, US09).
///
/// Điểm cốt lõi của US09 không phải cái nút, mà là **trạng thái nộp rõ ràng**:
/// sau khi gửi, người dùng phải thấy ngay "đã nộp lúc nào" hoặc "đang chờ".
/// Mất mạng thì vẫn xếp hàng và nói rõ — không im lặng thất bại.
class SubmitDocumentScreen extends StatefulWidget {
  const SubmitDocumentScreen({super.key, required this.projectId});

  final String projectId;

  @override
  State<SubmitDocumentScreen> createState() => _SubmitDocumentScreenState();
}

class _SubmitDocumentScreenState extends State<SubmitDocumentScreen> {
  String _fileName = 'sequence-diagram-v2.pdf';
  String? _submittedAt;

  static const _files = [
    'sequence-diagram-v2.pdf',
    'state-diagram-v1.pdf',
    'SRS_SmartCampus_v3.docx',
  ];

  void _submit() {
    final repo = ReviewRepository.instance;
    final sent = repo.write(
      id: widget.projectId,
      label: 'Nộp tài liệu',
      payload: _fileName,
    );
    setState(() => _submittedAt = sent
        ? 'Vừa xong'
        : 'Đang chờ mạng — đã xếp hàng');
  }

  @override
  Widget build(BuildContext context) {
    final repo = ReviewRepository.instance;

    return ListView(
      padding: const EdgeInsets.all(AppSpace.pagePad),
      children: [
        // Mất mạng thì banner phải có >=2 đường phục hồi (C6). OfflineBanner lo việc đó.
        if (repo.isOffline)
          OfflineBanner(onRetry: () => repo.setNet(NetState.online)),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Nộp tài liệu cho nhóm', style: AppText.sectionTitle),
              const SizedBox(height: AppSpace.xs),
              Text('Smart Campus Management · Group 01 · SE1701',
                  style: AppText.micro),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        AppCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Chọn tệp', style: AppText.blockTitle),
              const SizedBox(height: AppSpace.s),
              for (final f in _files) _fileRow(f),
            ],
          ),
        ),
        const SizedBox(height: AppSpace.l),
        _submitButton(),
        const SizedBox(height: AppSpace.l),
        _statusCard(),
        const SizedBox(height: AppSpace.huge),
      ],
    );
  }

  Widget _fileRow(String name) {
    final selected = _fileName == name;
    return Semantics(
      button: true,
      selected: selected,
      label: name,
      child: InkWell(
        onTap: () => setState(() => _fileName = name),
        borderRadius: AppRadius.buttonAll,
        child: Container(
          constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
          padding: const EdgeInsets.symmetric(vertical: AppSpace.s),
          child: Row(
            children: [
              Icon(
                selected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                size: 20,
                color: selected ? AppColors.brand : AppColors.muted,
              ),
              const SizedBox(width: AppSpace.m),
              Expanded(child: Text(name, style: AppText.bodySmall)),
              if (selected)
                const StatusChip(label: 'Đã chọn', tone: Tone.brand),
            ],
          ),
        ),
      ),
    );
  }

  Widget _submitButton() => Semantics(
    button: true,
    label: 'Nộp $_fileName',
    child: InkWell(
      onTap: _submit,
      borderRadius: AppRadius.buttonAll,
      child: Container(
        constraints: const BoxConstraints(minHeight: AppSpace.tapMin),
        padding: const EdgeInsets.symmetric(vertical: AppSpace.m),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: AppColors.brand,
          borderRadius: AppRadius.buttonAll,
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.upload_outlined, size: 20, color: Colors.white),
            const SizedBox(width: AppSpace.s),
            Text(
              'Nộp tài liệu',
              style: AppText.label.copyWith(color: Colors.white),
            ),
          ],
        ),
      ),
    ),
  );

  /// Trả lời trực tiếp câu hỏi của US09: "đã nộp chưa?".
  Widget _statusCard() => AppCard(
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Trạng thái nộp', style: AppText.blockTitle),
        const SizedBox(height: AppSpace.m),
        Row(
          children: [
            const Icon(Icons.description_outlined,
                size: 20, color: AppColors.muted),
            const SizedBox(width: AppSpace.m),
            Expanded(child: Text(_fileName, style: AppText.bodySmall)),
          ],
        ),
        const SizedBox(height: AppSpace.m),
        if (_submittedAt == null)
          const StatusChip(label: 'Chưa nộp', tone: Tone.neutral)
        else
          StatusChip(
            label: _submittedAt!,
            tone: _submittedAt!.startsWith('Vừa') ? Tone.brand : Tone.amber,
            icon: _submittedAt!.startsWith('Vừa')
                ? Icons.check_circle_outline
                : Icons.cloud_off_outlined,
          ),
        const SizedBox(height: AppSpace.s),
        Text(
          _submittedAt == null
              ? 'Chọn tệp rồi bấm "Nộp tài liệu".'
              : 'Nhóm sẽ thấy tệp này trong danh sách tài liệu của project.',
          style: AppText.micro,
        ),
      ],
    ),
  );
}
