import '../../101_domain_entities/101_DOMAIN_review_entities.dart';

/// Use case `US03` — lọc danh sách yêu cầu review theo từ khoá và trạng thái.
///
/// Luật này thuộc tầng nghiệp vụ (111), KHÔNG phải tầng giao diện (011).
/// Lý do tách: cùng một luật lọc được dùng ở nhiều màn (danh sách, tổng quan,
/// tìm kiếm), và phải kiểm được bằng test mà không cần dựng giao diện.
///
/// Khớp từ khoá theo: tên tài liệu, tên dự án, tên nhóm, người nộp.
/// Không phân biệt chữ hoa/thường.
class FilterRequestsUseCase {
  FilterRequestsUseCase._();

  /// [source] giữ nguyên thứ tự gốc. [keyword] rỗng = không lọc theo từ khoá.
  /// [statuses] rỗng = không lọc theo trạng thái; nhiều trạng thái = hoặc (OR).
  static List<ReviewRequest> run({
    required List<ReviewRequest> source,
    String keyword = '',
    List<DocStatus> statuses = const <DocStatus>[],
  }) {
    final k = keyword.trim().toLowerCase();
    return source.where((r) {
      if (statuses.isNotEmpty && !statuses.contains(r.status)) return false;
      if (k.isEmpty) return true;
      return r.documentTitle.toLowerCase().contains(k) ||
          r.projectName.toLowerCase().contains(k) ||
          r.groupName.toLowerCase().contains(k) ||
          r.submitter.toLowerCase().contains(k);
    }).toList();
  }
}
