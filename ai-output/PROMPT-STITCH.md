# Prompt dán vào Google Stitch

Mở https://stitch.withgoogle.com → dán toàn bộ khối dưới → sinh 8 màn hình.

Lưu ảnh kết quả vào chính thư mục này với tên:
- `loop1-before.png` — lần sinh đầu, chưa sửa gì
- `loop2-contrast.png` — sau khi kiểm tương phản
- `loop3-touch.png` — sau khi sửa vùng bấm

---

```
Thiết kế giao diện mobile-first cho "Hệ thống quản lý học vụ và review tài liệu cho giảng viên".

NGƯỜI DÙNG: Giảng viên đại học, dùng điện thoại khi di chuyển giữa các lớp.
Mục tiêu: xem hôm nay phải review gì, đọc tài liệu, ra quyết định phê duyệt hoặc yêu cầu chỉnh sửa.
Mỗi học kỳ phụ trách 4 lớp, ~30 nhóm, 20-35 yêu cầu review mỗi tuần.

BẢNG MÀU (bắt buộc dùng đúng, không thay):
- brand #146B55 (nút chính, tab đang chọn)
- brand-soft #EAF4ED, brand-tint #F2F7F3
- ink #24332D (chữ chính), muted #66736D (chữ phụ)
- line #E1E7E3 (viền), canvas #FAFBFA (nền), subtle #F7F9F7
- Trạng thái: olive #637344 (đã nộp), amber #756534 (chờ),
  rust #A65335 (cần sửa), danger #A34343 (không đạt)
- Nền trạng thái tương ứng: #F1F4E9, #F5F2E7, #FBF0EA, #FAEEEE

KIỂU CHỮ: Inter. Cỡ: 22 tiêu đề trang / 20 tiêu đề mục / 16 tiêu đề khối
/ 14 thân / 13 thân nhỏ / 12 nhãn / 11 siêu nhỏ. Thân tối thiểu 13px.

BO GÓC: chip 6, nút 8, thẻ 12, hộp thoại 16, viên thuốc 999.
KHOẢNG CÁCH: 4 / 8 / 12 / 16 / 24 / 32 / 48. Padding ngang 20px.
NỀN: SÁNG. Không làm chế độ tối.

KHUNG: rộng 412dp và 360dp. Header 56px, bottom nav 64px.
Vùng bấm tối thiểu 44x44px. Nút chính cao 44-48px.

CÁC MÀN HÌNH CẦN THIẾT KẾ (theo thứ tự):
1. Đăng nhập — form email/mật khẩu, logo trên cùng
2. Tổng quan — lời chào, 4 thẻ số liệu, khối việc cần làm,
   danh sách yêu cầu review gần đây
3. Yêu cầu review — ô tìm kiếm, chip lọc, ô sắp xếp, danh sách thẻ
4. Không gian review — thông tin tài liệu, 3 track trạng thái
   (Tài liệu / AI / Giảng viên), tệp đính kèm, phát hiện của AI,
   2 nút quyết định (Cần chỉnh sửa / Phê duyệt)
5. Kết quả AI Review — đếm lỗi/cảnh báo/gợi ý ở đầu, rồi liệt kê từng phát hiện
   kèm mức độ, nhóm lỗi và số trang
6. Lớp học — danh sách lớp kèm tình trạng sức khoẻ nhóm
7. Project — danh sách đồ án kèm thanh tiến độ và tình trạng
8. Tài liệu của project — tiến độ project, danh sách tài liệu kèm trạng thái

YÊU CẦU CHẤT LƯỢNG:
- Mọi danh sách dài phải có trạng thái đang tải (skeleton) và trạng thái rỗng kèm nút gợi ý
- Mọi trạng thái lỗi phải có ít nhất 2 đường phục hồi
- Mọi màn hình phải có nút quay lại, không có ngõ cụt
- Nhãn viết tiếng Việt, dùng đúng từ vựng: "Chờ review", "Đang review",
  "Cần chỉnh sửa", "Đã nộp lại", "Đã phê duyệt", "Không đạt"
- Chữ trên nền phải đạt tương phản 4.5:1

KHÔNG làm: không gradient trang trí, không bóng đổ nặng, không icon nhiều màu,
không hiệu ứng động phức tạp.
```
