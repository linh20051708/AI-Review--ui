# Persona — Hệ thống quản lý học vụ & Review tài liệu

Persona dưới đây **suy ra từ code nền thật** (`app/src/data/mockData.ts`, `app/src/types/index.ts`),
không phải tự nghĩ. Người dùng mặc định trong code là `currentUser = "Nguyễn Văn An", "Giảng viên / Supervisor"`.

---

## 1. Persona chính — Giảng viên phụ trách đồ án

| Thuộc tính | Giá trị |
|---|---|
| Họ tên | Nguyễn Văn An |
| Tuổi | 38 |
| Nghề | Giảng viên bộ môn Công nghệ phần mềm |
| Vai trong hệ thống | Supervisor (người duyệt) |
| Thiết bị | iPhone 14, dùng khi di chuyển giữa các lớp; laptop khi ngồi bàn |
| Học kỳ | Fall 2026 |
| Số lớp phụ trách | 4 lớp (~130 sinh viên, ~30 nhóm) |
| Số yêu cầu review / tuần | 20–35 |

### Mục tiêu

1. Biết ngay **hôm nay phải review gì** mà không phải mở từng lớp.
2. Duyệt tài liệu đúng hạn SLA (2–5 ngày tuỳ rule set) để nhóm kịp tiến độ.
3. Phát hiện nhóm nào đang chậm **trước khi** quá hạn, không phải sau.
4. Giữ phản hồi nhất quán giữa các nhóm — cùng một chuẩn cho mọi bài.
5. Phân biệt rõ đâu là **lỗi máy/AI phát hiện** và đâu là **nhận xét của mình**.

### Nỗi đau (bằng chứng từ code nền)

| Nỗi đau | Bằng chứng trong code |
|---|---|
| Phải mở nhiều lớp mới biết việc cần làm | `DashboardPage` có khối `attentionItems` gom việc gấp |
| Không rõ tài liệu đang ở công đoạn nào | `types/index.ts` tách **3 track**: `documentStatus` · `aiStatus` · `supervisorStatus` |
| Sinh viên nộp lại mà không rõ sửa gì | `DocumentVersion` bất biến + `ReviewFeedback` có `severity` |
| Quên mất chuẩn review của môn | `RuleSet` (AI auto/manual, SLA ngày, định dạng, số lần nộp lại) |
| Nhóm nộp bài mà mục trước chưa duyệt | `LabItem.dependsOn` → `submissionLocked` |
| Deadline khác nhau ở từng tầng | Cấu hình kế thừa 3 tầng: Offering → Class → Project (`lib/config.ts`) |

### Tiêu chí thành công

| Tiêu chí | Trọng số |
|---|---|
| Thấy việc cần làm trong 5 giây đầu | 30% |
| Biết tài liệu đang ở công đoạn nào | 25% |
| Duyệt / yêu cầu sửa không quá 3 lần bấm | 20% |
| Hiểu vì sao AI báo lỗi | 15% |
| Không bỏ sót nhóm quá hạn | 10% |

---

## 2. Persona phụ — Sinh viên trưởng nhóm

| Thuộc tính | Giá trị |
|---|---|
| Họ tên | Trần Thị Bình |
| Tuổi | 21 |
| Vai | Trưởng nhóm (Group 01, SE1701) |
| Thiết bị | Android, Samsung Galaxy A54 |
| Số thành viên | 5 |
| Số tài liệu phải nộp | 4 học kỳ này |

### Mục tiêu

1. Biết bài mình **còn thiếu gì** trước khi hết hạn.
2. Hiểu lỗi AI báo để sửa đúng chỗ.
3. Biết mục nào phải được duyệt trước mới nộp được mục sau.

### Nỗi đau

| Nỗi đau | Bằng chứng |
|---|---|
| Không biết vì sao **không gửi được** yêu cầu review | `submissionLocked` khi `dependsOn` chưa duyệt |
| AI báo lỗi nhưng không nói ở trang nào | `AIFinding.pageRef` (ví dụ "tr.12") |
| Nộp lại mà không rõ đã sửa hết chưa | `DocumentVersion` + đếm `feedbackCount` |

---

## 3. Ánh xạ nguyên tắc Nielsen

Mỗi nguyên tắc gắn với một thành phần **có thật** trong code nền.

| # | Nguyên tắc | Thành phần trong hệ thống |
|---|---|---|
| 1 | Hiển thị trạng thái hệ thống | `StatusBadge`, 3 track, skeleton khi tải (`ReviewListSkeleton`) |
| 2 | Khớp với thế giới thực | Từ vựng tiếng Việt: "Chờ review", "Cần chỉnh sửa", "Đã phê duyệt" (`statusMeta`) |
| 3 | Người dùng kiểm soát | Nút Back ở mọi màn, `BackLink`, hủy được trong `DecisionModals` |
| 4 | Nhất quán | Một từ vựng `Status` dùng chung cho mọi màn |
| 5 | Ngăn lỗi | `ConfirmModal` trước khi phê duyệt; chặn gửi khi `submissionLocked` |
| 6 | Nhận ra thay vì nhớ | Chip lọc hiện sẵn (`SmartFilterBar`), không bắt gõ lệnh |
| 7 | Dùng linh hoạt | Lọc + sắp xếp 5 kiểu (`SORTS` trong `ReviewRequestsPage`) |
| 8 | Thẩm mỹ tối giản | Mỗi màn theo một mục tiêu (`PageHeading` + một danh sách chính) |
| 9 | Giúp nhận ra & sửa lỗi | `AIFinding` có `level`, `category`, `pageRef`; nút Thử lại / Xem bản lưu |
| 10 | Trợ giúp | `EmptyState` có hành động gợi ý; nhãn tiếng Việt rõ nghĩa |

---

## 4. Yêu cầu khả năng tiếp cận

Áp cho cả hai persona:

| Yêu cầu | Ngưỡng | Cách kiểm |
|---|---|---|
| Kích thước vùng bấm | ≥ 44×44 px | Đo bằng `getBoundingClientRect` |
| Tương phản chữ | ≥ 4.5:1 | Tính công thức WCAG |
| Cỡ chữ thân | ≥ 13 px | Bảng kiểu chữ |
| Bề rộng màn hình | 360dp và 412dp | Render 2 viewport |
| Chữ lớn (tiêu đề) | ≥ 3:1 | Tính công thức WCAG |

> **Phát hiện thật:** app nền **đạt** ngưỡng tương phản chữ nhưng **không đạt** ngưỡng 44px ở nhiều chỗ
> (link phụ cao 17–26px, chip lọc 28–40px). Chi tiết và số đo ở `facts/MEASUREMENTS.md` §3.
