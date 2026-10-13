# Research Plan — Hệ thống quản lý học vụ & Review tài liệu

**Bước Lab 2:** Analyze · **Phase PRM393:** P1 (UX Research) · **Gate:** G1
**Trạng thái:** kế hoạch — **chưa thực hiện**. Lab 2 cho phép P1 ở mức tối thiểu (bài cá nhân,
thời gian ngắn), nhưng mọi nội dung chưa có bằng chứng phải gắn nhãn **Assumed**.

> **Cam kết trung thực:** repo này **chưa có phỏng vấn/quan sát người dùng thật**.
> File này là *kế hoạch*, không phải kết quả. Không có transcript, câu nói hay số liệu nào
> trong repo được bịa ra để lấp chỗ trống.

---

## 1. Mục tiêu nghiên cứu

| Mã | Câu hỏi cần trả lời | Lật giả định |
|---|---|---|
| RQ-01 | Giảng viên thực sự dùng thiết bị nào để review? | AS-01 |
| RQ-02 | Việc gì mất thời gian nhất khi review tài liệu? | AS-02, AS-05 |
| RQ-03 | Giảng viên xử lý thế nào **khi chưa có app**? | AS-02 |
| RQ-04 | Sinh viên bị chặn nộp bài thì hiểu sai ở đâu? | AS-06 |
| RQ-05 | 3 track trạng thái có giúp hiểu nhanh không, hay gây rối? | AS-08 |

---

## 2. Phương pháp & mẫu

| Hoạt động | Số người | Đối tượng | Cách làm |
|---|---|---|---|
| Phỏng vấn bán cấu trúc | 3 | Giảng viên đang chấm đồ án | 20–30 phút, ghi âm (xin phép), gỡ thông tin định danh |
| Quan sát có ngữ cảnh | 1–2 | Giảng viên trong buổi chấm bài | Xem trực tiếp, ghi bước + chỗ mất thời gian |
| Phỏng vấn ngắn | 3 | Sinh viên trưởng nhóm | 15 phút, tập trung vào lúc bị chặn nộp |
| Usability test prototype | 5 | Giảng viên/người mới | Task test với 8 màn hình lõi |

Tổng: **6–12 người** — mức tối thiểu đề xuất cho phạm vi hẹp (PRM393 §06).
**Không đủ để khẳng định tỉ lệ thống kê.**

---

## 3. Câu hỏi phỏng vấn theo hành vi

1. Lần gần nhất anh/chị review một tài liệu đồ án là khi nào?
2. Hãy kể lại từng bước anh/chị đã làm hôm đó.
3. Đoạn nào làm anh/chị mất thời gian hoặc dễ sai nhất?
4. Khi gặp trở ngại (không tìm thấy bài, không nộp được…), anh/chị xử lý thế nào?
5. Anh/chị đang dùng thiết bị/công cụ nào để làm việc này? Vì sao?
6. Điều gì khiến anh/chị thấy công việc đã hoàn thành tốt?

*Ghi chú:* hỏi **hành vi đã xảy ra**, không hỏi ý kiến về giải pháp.

---

## 4. Phân biệt dữ liệu & suy đoán (Chuẩn chung C2)

| Nhãn | Định nghĩa | Cách ghi kèm |
|---|---|---|
| Observed | quan sát trực tiếp | Mã nguồn E-xx + bối cảnh |
| Reported | người tham gia thuật lại | Mã nguồn E-xx |
| Inferred | nhóm suy luận từ pattern | Ghi lý do suy luận |
| Assumed | chưa có bằng chứng | Phải kiểm tra |

Ví dụ: "Giảng viên dùng điện thoại khi di chuyển" **chỉ được ghi là finding** nếu có phỏng vấn/quan sát thật.
Hiện tại nó là **Assumed (AS-01)**.

---

## 5. Đạo đức nghiên cứu

- Không nộp transcript có thông tin nhận dạng cá nhân nếu không cần thiết.
- Xin phép trước khi ghi âm; gỡ tên/email/số điện thoại khỏi ghi chú trước khi lưu vào repo.
- Với người tham gia là trẻ vị thành niên: cần quy trình đồng ý của người giám hộ.

---

## 6. Đầu ra khi hoàn thành

| Đầu ra | Nơi lưu |
|---|---|
| Ghi chú phỏng vấn đã ẩn danh | `ux/research-notes.md` (chưa tồn tại — tạo khi chạy) |
| Bảng evidence matrix (Observed/Reported/Inferred/Assumed) | `ux/evidence-matrix.md` |
| Persona cập nhật từ Proto → Qualitative | cập nhật `ux/persona.md`, đổi nhãn trạng thái |
| Báo cáo usability test | `ux/usability-report.md` |

---

## 7. Kế hoạch khi nào chạy

Lab 2 là bài cá nhân thời gian ngắn → P1 giữ ở mức tối thiểu. Nếu có điều kiện (đồ án nhóm /
capstone), chạy đủ 6 gate và thay các nhãn **Assumed** bằng bằng chứng thật.
