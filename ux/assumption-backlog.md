# Assumption & Research Backlog

**Bước Lab 2:** Analyze · **Phase PRM393:** P0–P1 · **Gate:** G0–G1
**Trạng thái bằng chứng:** tất cả dòng dưới là **ASSUMED** trừ khi ghi rõ.

Theo **Chuẩn chung C2**: `Fact = Observed/Reported` · `Hypothesis = Inferred` · `Unknown = Assumed`.
Vì Lab 2 **chưa phỏng vấn người dùng**, phần lớn giả định thuộc nhóm **Assumed**.

---

## 1. Giả định đang treo

| Mã | Giả định | Loại (C2) | Nguồn suy ra | Rủi ro nếu sai | Ưu tiên kiểm |
|---|---|---|---|---|---|
| AS-01 | Giảng viên thao tác chủ yếu trên điện thoại | Assumed | Persona P01 | Cả thiết kế mobile-first sai hướng | **Cao** |
| AS-02 | Nỗi đau lớn nhất là định vị việc gấp | Assumed | `E-01` | Màn Tổng quan đặt sai trọng tâm | **Cao** |
| AS-03 | Giảng viên quan tâm tính nhất quán phản hồi giữa nhóm | Assumed | `E-04` | Màn hiện rule set là thừa | Trung bình |
| AS-04 | 20–35 yêu cầu/tuần, 4 lớp, ~30 nhóm | Assumed | mockData (dữ liệu mẫu, không phải thật) | Hàng đợi bị thiết kế sai quy mô | Trung bình |
| AS-05 | Người dùng ưu tiên thấy việc gấp hơn thẻ số liệu | Assumed | Thiết kế | Thứ tự màn Tổng quan sai | Trung bình |
| AS-06 | Sinh viên năm nhất cần hướng dẫn thêm khi nộp | Assumed | `stakeholder-map` §3 | Bỏ sót nhóm người dùng | **Cao** |
| AS-07 | Vùng chạm < 48dp gây bấm sai với người dùng thật | Inferred | `MEASUREMENTS` §3 (đo thật trên app) | Sửa vùng chạm tốn công mà lợi ích thấp | Thấp (đã đo) |
| AS-08 | 3 track trạng thái giúp người dùng hiểu nhanh | Assumed | `E-02` | 3 track gây rối thay vì rõ | Trung bình |

---

## 2. Đã có bằng chứng (Fact)

| Mã | Sự thật | Loại | Bằng chứng |
|---|---|---|---|
| F-01 | App nền có 23 route, bottom nav 5 tab | **Observed** | `app/src/app/router.tsx`, `BottomNavigation.tsx` |
| F-02 | Vùng chạm nhiều chỗ chỉ 17–28px | **Observed** | `facts/MEASUREMENTS.md` §3 (đo `getBoundingClientRect`) |
| F-03 | Tương phản màu đạt WCAG AA toàn bộ (thấp nhất 4.78) | **Observed** | `facts/MEASUREMENTS.md` §4 |
| F-04 | Không vỡ layout ở 360dp và 412dp | **Observed** | `facts/MEASUREMENTS.md` §2 |
| F-05 | Ba track trạng thái tách bạch trong model | **Observed** | `app/src/types/index.ts` |
| F-06 | Deadline kế thừa 3 tầng Offering → Class → Project | **Observed** | `app/src/lib/config.ts` |

---

## 3. Research backlog (việc cần làm để lật giả định → fact)

| Ưu tiên | Việc | Phỏng vấn gì | Lật giả định nào |
|---|---|---|---|
| 1 | Phỏng vấn 3 giảng viên đang chấm đồ án | Q1, Q2, Q5 | AS-01, AS-02, AS-04 |
| 2 | Quan sát 1 buổi giảng viên chấm bài thật | Q2, Q3 | AS-02, AS-05, AS-08 |
| 3 | Phỏng vấn 3 sinh viên trưởng nhóm | Q1, Q4, Q6 | AS-06 |
| 4 | Usability test 5 người với prototype | — | AS-05, AS-08 |

**Ngân sách tối thiểu (theo PRM393 §06):** 6–12 phỏng vấn/quan sát tổng cho phạm vi hẹp.
Mốc này là **hướng dẫn lớp học**, không đủ để tuyên bố đại diện thống kê.

---

## 4. Điều KHÔNG được làm

- Không ghi giả định thành fact trong báo cáo.
- Không bịa transcript, câu nói, hay số liệu phỏng vấn.
- Không gắn ảnh/quote cho persona khi chưa có nguồn.
