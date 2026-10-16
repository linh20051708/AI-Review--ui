# DESIGN DECISIONS & ACCESSIBILITY — PROJECT REVIEW AI

**Mục đích:** kết nối persona, Nielsen heuristics, constraints với các quyết định thiết kế thực tế. **Trạng thái:** đề xuất để đối chiếu với log AI, Figma và code mới nhất.

## 1. Nguyên tắc
- Dựa vào Primary Persona (Supervisor) cần ưu tiên công việc review; Student cần nhận feedback và nộp version rõ ràng.
- **ACCEPT** = tiếp nhận đề xuất AI sau đánh giá; **MODIFY** = thay đổi đề xuất; **REJECT** = bác bỏ đề xuất; chỉ dùng nhãn này nếu tồn tại output AI làm bằng chứng.
- Không đánh đồng business rules vốn có với đề xuất do AI đưa ra.

## 2. Decision register (ứng viên, chưa xác thực lịch sử AI)
| ID | Quyết định đề xuất | Loại sau đối chiếu AI | Persona / Need | Nguyên tắc / Ràng buộc | Evidence |
|---|---|---|---|---|---|
| D01 | Duy trì 5 tab BottomNav Supervisor | `[ACCEPT?]` | Supervisor truy cập review nhanh | Recognition, hạn chế overload | `[LINK AI OUTPUT & FIGMA]` |
| D02 | Đưa quản lý học vụ vào Quick Access Dashboard | `[MODIFY?]` | Ưu tiên review hơn setup | Minimalist design | `[LINK]` |
| D03 | Status Badge kèm chữ và icon | `[ACCEPT?]` | Dễ nhận trạng thái trên mobile | Không chỉ dùng màu | `[LINK]` |
| D04 | Confirmation Dialog trước approve/reject/revise | `[MODIFY?]` | Tránh quyết định nhầm | Error prevention | `[LINK]` |
| D05 | Không cho AI tự Approve | `[REJECT?]` | Supervisor kiểm soát chuyên môn | Business rule bắt buộc | `[AI ĐÃ TỪNG ĐỀ XUẤT? NẾU KHÔNG, CHUYỂN THÀNH RULE]` |

## 3. Detailed decision record (lặp cho mỗi quyết định thực)
- **ID:** `[Dx]`
- **AI suggestion:** `[TRÍCH ĐÚNG GỢI Ý AI]`
- **Decision:** `[ACCEPT/MODIFY/REJECT]`
- **Persona & context:** `[PX, USE CASE]`
- **Heuristic/constraint:** `[NIELSEN / MOBILE]`
- **Before → After:** `[ẢNH / FIGMA FRAME]`
- **Validation:** `[KẾT QUẢ TASK TEST NẾU CÓ]`

## 4. Accessibility verification
| Hạng mục | Ngưỡng Lab 2 | Màn hình cần test | Thực đo / bằng chứng | Kết quả |
|---|---|---|---|---|
| Normal text contrast | ≥4.5:1 | Dashboard, Workspace, Student Upload | `[HEX 1, HEX 2, RATIO, ẢNH]` | NOT TESTED |
| Large text / controls | ≥3:1 | Buttons, badges, icons | `[RATIO]` | NOT TESTED |
| Touch targets | ≥48×48dp | BottomNav, CTA, Dialog | `[KÍCH THƯỚC]` | NOT TESTED |
| Body typography | ≥14sp | Review Queue / Feedback | `[STYLE]` | NOT TESTED |
| Responsive 360 | Không tràn ngang/che nội dung | Dashboard, Workspace | `[SCREENSHOT]` | NOT TESTED |
| Responsive 412 | Không tràn ngang/che nội dung | Dashboard, Workspace | `[SCREENSHOT]` | NOT TESTED |
| Không chỉ dùng màu | Text/icon phân biệt trạng thái | Badge/AI states | `[SCREENSHOT]` | NOT TESTED |

## 5. Test scenarios để tạo bằng chứng
1. Review Queue 360dp: ẩn filter nâng cao trong bottom sheet, check tap và horizontal overflow.
2. Workspace 412dp: document, findings, feedback và CTA không chồng lên nhau.
3. Student Upload 360dp: file validation error có chữ giải thích và Retry.
4. Contrast: kiểm tra từng cặp foreground/background thực tế bằng công cụ đo, lưu kết quả.
5. Token change: thay primary token trong Figma rồi xác minh instances được cập nhật.

## 6. Traceability
| Persona need | UI decision | Component / screen | User test | Evidence |
|---|---|---|---|---|
| Supervisor ưu tiên review | Quick access và review cards | S02/S10 | Tìm review cần xử lý | `[ ]` |
| Supervisor cần kiểm soát phê duyệt | 3 decisions + dialog | S11 | Review không approve nhầm | `[ ]` |
| Student cần sửa có hướng dẫn | Feedback + upload new version | ST03/ST04 | Nộp lại v2 | `[ ]` |

**Kết luận:** điền số đo/ảnh sau khi kiểm tra, không tự tuyên bố đạt accessibility.
