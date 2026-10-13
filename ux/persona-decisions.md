# Persona → Need → UI decision → Test

**Bước Lab 2:** Analyze → Refine · **Phase PRM393:** P2–P4 · **Gate:** G2–G4
**Trạng thái bằng chứng:** ASSUMED (need) · OBSERVED (test đã chạy — xem `verify/journeys.mjs`).

Ma trận này nối persona với quyết định thiết kế **và phương pháp kiểm chứng** (mục kiểm #10 của Persona rubric).

---

## 1. Ma trận

| # | Persona | Need (kết quả mong muốn) | Ý tưởng / Quyết định UI | Màn hình | Cách kiểm chứng | Trạng thái |
|---|---|---|---|---|---|---|
| PN-01 | P01 | Biết ngay hôm nay phải review gì | Khối `attentionItems` là nội dung đầu màn Tổng quan | S02 | 5-second test: nhìn 5s kể được việc gấp | ✅ test tay (chưa có người thật) |
| PN-02 | P01 | Biết tài liệu ở công đoạn nào | Hiển thị **3 track** tách bạch | S04 | Task test: kể đúng trạng thái hiện tại | ✅ journeys.mjs |
| PN-03 | P01 | Duyệt/yêu cầu sửa không quá 3 lần bấm | 2 nút quyết định ngay trên màn review + `ConfirmModal` | S04 | Đếm số click thực tế trong `journeys.mjs` | ✅ 3 bấm |
| PN-04 | P01 | Hiểu vì sao AI báo lỗi | `AIFinding` có `level` + `category` + `pageRef` | S05 | Task test: tìm được số trang của một lỗi | ✅ journeys.mjs |
| PN-05 | P01 | Không bỏ sót nhóm quá hạn | Huy hiệu sức khoẻ nhóm (`GroupHealth`) trên thẻ project | S11 | Quan sát: tìm nhóm `overdue` không cần mở | ✅ journeys.mjs |
| PN-06 | P01 | Thấy chuẩn đang áp tại chỗ ra quyết định | Hiện rule set + deadline đã resolve kèm nguồn gốc tầng | S04 | Kiểm: nguồn hiển thị đúng Offering/Class/Project | ✅ journeys.mjs |
| PN-07 | P01 | Thao tác một tay không bấm sai | Nâng mọi vùng chạm lên **48dp** | Toàn bộ | `getBoundingClientRect` trên mọi phần tử tương tác | ⚠️ còn vi phạm — xem `facts/MEASUREMENTS.md` §3 |
| PN-08 | P02 | Hiểu vì sao không gửi được | Nút bị khoá kèm lý do (`dependsOn` chưa duyệt) | S13 | Task test: đọc được lý do khoá | ✅ journeys.mjs |
| PN-09 | P02 | Biết lỗi AI ở trang nào | `pageRef` trong danh sách phát hiện | S05 | Task test: nêu đúng số trang | ✅ journeys.mjs |
| PN-10 | P02 | Biết đã sửa hết chưa | So sánh phiên bản + đếm phản hồi | S06, S07 | Task test: kể được khác biệt giữa 2 phiên bản | ✅ journeys.mjs |
| PN-11 | Cả hai | Không bị kẹt khi mạng lỗi | Mọi lỗi có ≥2 đường phục hồi (Thử lại + Xem bản lưu) | S02, S03 | Task test: ngắt mạng → vẫn thoát được | ✅ journeys.mjs |
| PN-12 | Cả hai | Đọc rõ chữ trên nền | Tương phản ≥4.5:1 (đo thật thấp nhất 4.78) | Toàn bộ | Công thức WCAG trên 11 cặp màu | ✅ đạt |

---

## 2. Truy vết chuỗi (Chuẩn chung C7)

`E → Insight → P/Need → F → S → T`

| Chuỗi | Bằng chứng | Insight | Persona | Need | Flow | Màn hình | Test |
|---|---|---|---|---|---|---|---|
| TC-01 | E-01 | INS-A | P01 | PN-01 | F01 | S02 | 5-second test |
| TC-02 | E-02 | INS-B | P01 | PN-02 | F01 | S04 | journeys T02 |
| TC-03 | E-02 | INS-B | P01 | PN-03 | F01 | S04 | journeys T03 (đếm bấm) |
| TC-04 | E-02 | INS-B | P01, P02 | PN-04, PN-09 | F01 | S05 | journeys T04 |
| TC-05 | E-06 | INS-A | P01 | PN-05 | F01 | S11 | journeys T05 |
| TC-06 | E-04, E-06 | INS-C | P01 | PN-06 | F01 | S04 | journeys T06 |
| TC-07 | MEAS §3 | INS-D | P01, P02 | PN-07 | — | Toàn bộ | đo `getBoundingClientRect` |
| TC-08 | E-05 | INS-E | P02 | PN-08 | F01, F03 | S13 | journeys T08 |
| TC-09 | E-03 | INS-B | P02 | PN-10 | F02 | S06, S07 | journeys T09 |
| TC-10 | Luồng 3 | INS-E | P01, P02 | PN-11 | F03 | S02, S03 | journeys T10 |
| TC-11 | MEAS §4 | — | P01, P02 | PN-12 | — | Toàn bộ | WCAG contrast |

---

## 3. Ghi chú trung thực

- Các ô "Trạng thái ✅" là kết quả chạy **tự động** bằng `verify/journeys.mjs` (33/33 OK) và
  đo đạc headless — **không phải usability test với người dùng thật**.
- `PN-07` (vùng chạm 48dp) **chưa đạt** trên app nền; đây là finding thật, không được đánh dấu đạt.
- Chưa có `T`nào chạy với người thật → cột cuối vẫn là **giả định chờ kiểm chứng**.
