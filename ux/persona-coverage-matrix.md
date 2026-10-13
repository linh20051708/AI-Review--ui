# Persona Coverage Matrix — Hệ thống quản lý học vụ & Review tài liệu

**Bước Lab 2:** Analyze · **Phase PRM393:** P2 · **Gate:** G2
**Trạng thái bằng chứng:** ASSUMED (P01, P02) · OBSERVED (cột rào cản đo được).

---

## 1. Ma trận độ phủ

| Archetype | Tác vụ chính | Thiết bị / rào cản | Khác biệt cần thiết kế | Evidence |
|---|---|---|---|---|
| **P01 · Supervisor** | Điều hành việc review: xem hàng đợi, đọc tài liệu, ra quyết định | iPhone 14 · một tay · 3–7 phút/lần · mạng 4G chập chờn · vùng chạm app nền chỉ 17–28px | Thấy việc gấp trong 5 giây; 3 track trạng thái; quyết định ≤3 lần bấm; nút to ≥48dp | ASSUMED (hành vi) + OBSERVED (vùng chạm) |
| **P02 · Sinh viên trưởng nhóm** | Nộp tài liệu, gửi yêu cầu review, xử lý phản hồi | Galaxy A54 · tối ở nhà · mạng có thể yếu · không rành cấu hình | Biết vì sao bị khoá (`dependsOn`); thấy vị trí lỗi AI (`pageRef`); biết đã sửa hết chưa | ASSUMED |
| **Giáo vụ** (ngoài phạm vi) | Cấu hình học kỳ/môn/lớp/rule set | Desktop · nhiều dữ liệu | Không thiết kế trong Lab 2 | ASSUMED |
| **Sinh viên thành viên** (ngoài phạm vi) | Được ghi danh, không nộp trực tiếp | — | Không thiết kế | ASSUMED |

---

## 2. Kiểm tra độ phủ — mỗi persona có bị thiếu nhu cầu không

Câu hỏi kiểm: **"Nếu xóa Persona này, nhóm có bỏ sót nhu cầu quan trọng nào không?"**

| Nếu xóa | Mất gì | Kết luận |
|---|---|---|
| Xóa P01 | Mất toàn bộ động lực thiết kế (hàng đợi việc gấp, quyết định nhanh, nhất quán) | **Không thể xóa** — Primary |
| Xóa P02 | Mất nhu cầu "hiểu vì sao bị chặn" và "thấy vị trí lỗi" → màn `S05` mất lý do tồn tại | Giữ — Secondary có nhu cầu khác thật |
| Gộp P01 + P02 | Mất phân biệt "duyệt" vs "nộp"; thiết kế sẽ lẫn vai trò và quyền hạn | **Không gộp** |

---

## 3. Tính khác biệt (chống "5 persona chỉ đổi tên")

| Tiêu chí | P01 | P02 | Khác biệt? |
|---|---|---|---|
| Goals | Biết việc gấp, duyệt đúng hạn | Nộp đúng hạn, hiểu lỗi | ✅ Khác |
| Behaviors | Duyệt, quyết định | Nộp, sửa theo phản hồi | ✅ Khác hướng |
| Context | Di chuyển, 3–7 phút, một tay | Ở nhà, buổi tối | ✅ Khác |
| Constraints | Thời gian ngắn, chú ý phân tán | Không rành cấu hình hệ thống | ✅ Khác |
| Thiết bị | iOS | Android | ✅ Khác |
| **Kéo theo quyết định UI khác?** | Có — hàng đợi, quyết định 1 chạm | Có — giải thích khoá + vị trí lỗi | ✅ **Có** |

Kết luận: 2 persona **khác nhau về hành vi và kéo theo quyết định UI khác** — không phải bản sao nhân khẩu.

---

## 4. Truy vết persona → màn hình

| Persona | Màn hình phục vụ | Flow |
|---|---|---|
| P01 | S01, S02, S03, S04, S05, S06, S07, S08, S09, S10, S11, S12, S13, S14, S22, S23 | F01, F02, F03 |
| P02 | S01, S11, S12, S13, S14, S16 | F01 (đầu vào), F03 |

Mọi màn hình đều thuộc ít nhất một flow (Chuẩn chung C7).
