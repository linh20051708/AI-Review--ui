# LAB2-GATE — Kết quả tự chấm

Chạy lại: `python3 lab2-gate.py`

## Kết quả

```
TONG: 100/100 diem  (100%)
KET QUA: DAT — duoc tat ca cac muc co the kiem tu dong
```

## Chi tiết theo rubric

| Mục | Nội dung | Điểm | Trạng thái |
|---|---|---|---|
| A | Phân tích UX & user flow | 15/15 | ✅ |
| B | Tạo UI bằng AI | 10/10 | ✅ |
| C | Lặp & critique với AI | 15/15 | ✅ |
| D | UI/UX cuối | 20/20 | ✅ |
| E | Design system & component | 15/15 | ✅ |
| F | Prototype tương tác | 10/10 | ✅ |
| G | Handoff Flutter | 10/10 | ✅ |
| H | Tài liệu & nhật ký AI | 5/5 | ✅ |
| | **Tổng** | **100/100** | |

## Chi tiết từng tiêu chí

| Mục | Tiêu chí | Điểm |
|---|---|---|
| A | 2 persona + mục tiêu + nỗi đau + 10 ánh xạ Nielsen | 6/6 |
| A | ≥8 màn hình + 3 luồng + luồng lỗi + ma trận Back | 9/9 |
| B | `DESIGN.md`: prompt nguyên văn có ràng buộc đầy đủ | 10/10 |
| C | `ai-design-log.md`: 3 vòng prompt→output→critique→quyết định | 6/6 |
| C | `ux/critique.md`: 8 phát hiện ≥5, có số đo + Nielsen | 5/5 |
| C | `design-decisions.md`: 6 quyết định từ chối AI | 4/4 |
| D | 24 khung màn hình chính (cần ≥8) | 10/10 |
| D | `ux/final-ui-spec.md`: 14 màn + biến thể + 360dp | 6/6 |
| D | 7 biến thể trạng thái + 3 khung 360dp | 4/4 |
| E | `design-system.md`: màu + chữ + khoảng cách + bó góc + 9 nhóm | 7/7 |
| E | 9 khung component | 5/5 |
| E | 5 bảng design system | 3/3 |
| F | 3 luồng từng bước + hiệu ứng + script demo | 10/10 |
| G | Token → Dart + component → widget | 6/6 |
| G | 96 dòng bảng đối chiếu | 4/4 |
| H | README + README_ANSWER + ai-design-log | 3/3 |
| H | README liệt kê 2 artifact + hướng dẫn | 2/2 |

---

## Bốn tầng kiểm định SVG

| Tầng | Lệnh | Kết quả |
|---|---|---|
| Cú pháp & ràng buộc | `python3 check.py` | 48 file, 1058 đoạn text — SẠCH |
| Đo font thật | `python3 measure.py` | 1010 đoạn text trong Chrome — SẠCH |
| Render thật | `python3 rendercheck.py` | 48/48 file render đúng — SẠCH |
| Rò CJK | (script nội bộ) | 12 file markdown — 0 rò |

Chi tiết `check.py`: XML hợp lệ · không CJK · không tràn khung ·
không dùng `<filter>` `<mask>` `<clipPath>` `<linearGradient>` `<foreignObject>` (Figma cắt bỏ khi dán).

---

## Lỗi đã sửa trong quá trình làm

Ghi lại để chứng minh cổng không phải hình thức.

| # | Lỗi | Cách sửa |
|---|---|---|
| 1 | Mũi tên dùng SVG `<marker>` — Figma bỏ, mũi tên mất đầu | Vẽ mũi tên bằng `<polygon>` thật |
| 2 | Chip `Chờ review` tràn phải (x=443 > 412) | Đổi `text-anchor` sang `middle` |
| 3 | Thẻ số liệu cuộn ngang tràn khung | Đổi thành lưới 2×2 |
| 4 | Ghi chú `comp-button` dài 467px | Ngắt thành 2 dòng |
| 5 | Khung 360dp chứa quá nhiều mục, tràn dọc | Số mục theo chiều cao khung |
| 6 | Manifest ghi sai đường dẫn (`01-user/flow/`) | Bảng ánh xạ page → thư mục, kiểm 48 đường dẫn tồn tại |
| 7 | Bảng component thấp hơn nội dung | Tự tính chiều cao theo toạ độ `y` lớn nhất |

**Từ 29 lỗi ban đầu → 0.** Không có lỗi nào được sửa bằng cách nới ngưỡng.

Ví dụ cụ thể: khung 360dp ban đầu chỉ bị đổi kích thước `viewBox` nên nội dung bị **cắt**
chứ không được bố cục lại. Đã sửa bằng cách **chạy lại hàm dựng** với `W,H = 360,800`,
nên nội dung 360dp thật sự khác (kiểm md5 thấy khác nhau).

---

## Điều cổng này KHÔNG kiểm được

Trung thực về giới hạn:

| Không kiểm được | Vì sao |
|---|---|
| File Figma 6 page có tồn tại không | Cần tài khoản Figma — `README.md` §2.2 |
| Prototype có nối link chạy được không | Cần dựng tay trong Figma |
| Ảnh Google Stitch có thật không | Cần chạy công cụ AI — `README.md` §2.3 |
| Auto Layout / Variables đã tạo chưa | Paste SVG không tạo được |
| Link GitHub có mở được không | Chưa push |

Cổng chỉ chấm phần **tài liệu và bộ khung SVG trong repo**. Bốn việc trên phải làm bằng tay và
phải tự kiểm trước khi nộp — danh sách ở `ux/prototype-spec.md` §8.
