# Test Cases theo CMPlan — 140 test case

**Kèm theo:** `docs/CMPlan.md` §3 · **Ngày:** 14/10/2026

> **Quan hệ với `docs/test-cases.md`:** file này **không thay thế** file kia. `docs/test-cases.md`
> là 22 test case kèm mã Lab 2 (`4-TC-01`…`4-TC-22`), đã có cổng truy vết `check-trace.py`.
> File **này** là bộ 140 test case theo định mức CMPlan PRM393 (≥10 TC/User Story, đủ 5 nhóm).
> Hai bộ dùng chung nguồn User Story ở `ux/user-stories.md`. Bảng dịch mã ở `docs/CMPlan-MAP.md` §5.

---

## 1. Tổng kết độ bao phủ

| User Story | Nội dung | Persona | UC | Số TC | HP | AP | BV | EX | UI |
|---|---|---|---|---|---|---|---|---|---|
| `US01` | Dang nhap SSO truong | `P01` | `UC01` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US02` | Thay viec gap trong ngay | `P01` | `UC02` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US03` | Loc danh sach yeu cau review | `P01` | `UC03` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US04` | Mo tai lieu, du thong tin quyet dinh | `P01` | `UC04` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US05` | Hieu vi sao AI bao loi | `P01` | `UC05` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US06` | Phe duyet voi it bam nhat | `P01` | `UC06` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US07` | Yeu cau chinh sua va huy duoc | `P01` | `UC07` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US08` | So sanh hai phien ban | `P01` | `UC08` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US09` | Nop tai lieu cho nhom | `P02` | `UC09` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US10` | Biet vi sao nut nop bi khoa | `P02` | `UC10` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US11` | Khong bi ket khi mat mang | `P01+P02` | `UC11` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US12` | Thay suc khoe nhom | `P01` | `UC12` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US13` | Biet chuan nao dang ap | `P01` | `UC13` | 10 | 2 | 2 | 2 | 2 | 2 |
| `US14` | Xem ho so va dang xuat | `P01+P02` | `UC14` | 10 | 2 | 2 | 2 | 2 | 2 |
| **Tổng** | 14 user story | | | **140** | 28 | 28 | 28 | 28 | 28 |

Mỗi User Story có **đúng 10** test case, phân bổ **đều 2-2-2-2-2** qua 5 nhóm.
Cổng `rules/check-cmplan.py` đếm lại từng US và chặn nếu thiếu.

### 1.1 Năm nhóm phân loại — định nghĩa

| Mã | Nhóm | Kiểm gì |
|---|---|---|
| `HP` | Happy Path — luồng chuẩn | Luồng thành công tiêu chuẩn + **tiêu chí đo lường của Persona** (số thao tác, thời gian) |
| `AP` | Alternative Path — rẽ nhánh hợp lệ | Người dùng đổi ý, huỷ thao tác, hoặc dùng cách thay thế |
| `BV` | Boundary & Validation — biên & ràng buộc | Giá trị biên min/max, bộ đếm, giới hạn ký tự/số phần tử |
| `EX` | Exception & Recovery — ngoại lệ, mất mạng | Mất kết nối, bấm đúp, lỗi từ tầng `202`, tự phục hồi |
| `UI` | UI/UX & Accessibility — chuẩn chung | Vùng chạm `≥48dp`, chữ `≥14sp`, contrast `4.5:1 / 3:1`, không che vùng làm việc |

---

## 2. Chi tiết từng User Story

### 2.1 · `US01` — Dang nhap SSO truong

**Truy vết:** `P01` → `UC01` → `US01` → Figma `011_*_US01_*` → code `features/login/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US01_HP_01` | HP | Mo app lan dau, bam 'Dang nhap bang SSO truong', xac thuc thanh cong | `011 -> 202` | Vao Tong quan trong <= 3 thao tac cham; khong hoi mat khau lan hai |
| `TC_US01_HP_02` | HP | Da dang nhap SSO, mo lai app sau khi tat | `011 -> 202` | Phien duoc nho, vao thang Tong quan, khong bat dang nhap lai |
| `TC_US01_AP_01` | AP | Bam SSO nhung bam 'Huy' o man xac thuc cua truong | `011` | Quay ve man dang nhap, khong vao duoc app, khong hien loi do |
| `TC_US01_AP_02` | AP | Nhap email thu cong thay vi SSO, email hop le | `011 -> 202` | Vao duoc Tong quan, ghi nhan dang nhap bang email |
| `TC_US01_BV_01` | BV | Email thieu ky tu '@' | `001 -> 011` | Nut Dang nhap bao loi 'Email chua dung dinh dang.', khong goi mang |
| `TC_US01_BV_02` | BV | Email dai 254 ky tu (bien tren) | `001 -> 011` | Chap nhan hoac bao loi ro rang; khong crash, khong tran o nhap |
| `TC_US01_EX_01` | EX | Mat mang ngay luc bam SSO | `202 -> 011` | Hien thong bao khong ket noi duoc, giu nguyen man dang nhap, cho thu lai |
| `TC_US01_EX_02` | EX | Bam dup nut SSO lien tuc | `011 -> 111` | Co che chan: chi 1 yeu cau xac thuc duoc gui di |
| `TC_US01_UI_01` | UI | Do vung cham nut SSO va o nhap email | `001 -> 011` | Moi vung cham >= 48x48dp; nhan >= 14sp; contrast chu >= 4.5:1 |
| `TC_US01_UI_02` | UI | Do contrast nut Dang nhap tren nen canvas | `001` | Contrast chu tren nut >= 4.5:1; vien nut >= 3:1 |

### 2.2 · `US02` — Thay viec gap trong ngay

**Truy vết:** `P01` → `UC02` → `US02` → Figma `011_*_US02_*` → code `features/dashboard/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US02_HP_01` | HP | Mo Tong quan khi co 4 viec gap | `011 -> 202` | 4 the muc do uu tien hien dung thu tu; so lieu khop du lieu nguon |
| `TC_US02_HP_02` | HP | Doc het danh sach viec gap roi bam vao 1 muc | `011 -> 202` | Mo dung tai lieu cua muc do; khong mat vi tri cuon |
| `TC_US02_AP_01` | AP | Khong co viec gap nao | `011` | Hien trang thai rong co huong dan, khong hien danh sach trong |
| `TC_US02_AP_02` | AP | Keo lam moi (pull to refresh) | `202 -> 011` | Du lieu nap lai; neu khong doi thi khong nhay giao dien |
| `TC_US02_BV_01` | BV | Dung 0 viec gap | `011` | The dem hien '0', khong vo bo cuc the |
| `TC_US02_BV_02` | BV | Dung 50 viec gap | `011` | Danh sach cuon duoc, khong tran khung, the khong bi bop meo |
| `TC_US02_EX_01` | EX | Mat mang khi dang xem Tong quan | `202 -> 011` | Hien bang offline, van xem duoc so lieu da cache |
| `TC_US02_EX_02` | EX | Bam dup vao mot the viec gap | `011 -> 111` | Chi mo 1 man, khong chong 2 lan dieu huong |
| `TC_US02_UI_01` | UI | Do 4 the so lieu va vung cham cua the | `001 -> 011` | The hien du so, khong bi cat chu; vung cham >= 48dp |
| `TC_US02_UI_02` | UI | Kiem so lieu dai (vi du 4 chu so) trong the | `011` | So khong tran the, tu thu nho hoac xuong dong dung |

### 2.3 · `US03` — Loc danh sach yeu cau review

**Truy vết:** `P01` → `UC03` → `US03` → Figma `011_*_US03_*` → code `features/request_list/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US03_HP_01` | HP | Mo tab Yeu cau review, thay danh sach day du | `011 -> 202` | Hien danh sach; moi the du ma lop, nhom, du an, trang thai |
| `TC_US03_HP_02` | HP | Chon chip loc 'Cho giang vien review' | `111 -> 011` | Danh sach rut gon dung trang thai; con so dem khop |
| `TC_US03_AP_01` | AP | Chon loc roi bo loc | `111 -> 011` | Danh sach tro ve day du nhu truoc khi loc |
| `TC_US03_AP_02` | AP | Tim kiem theo ten nhom khong dau | `111 -> 011` | Tim thay ket qua khop khong phan biet dau |
| `TC_US03_BV_01` | BV | Tim kiem voi tu khoa rong | `011` | Hien lai toan bo danh sach, khong bao loi |
| `TC_US03_BV_02` | BV | Loc voi 0 ket qua | `011` | Hien trang thai rong co goi y bo loc, khong hien danh sach trong |
| `TC_US03_EX_01` | EX | Mat mang khi dang loc | `202 -> 011` | Loc van chay tren du lieu cache; co bang offline |
| `TC_US03_EX_02` | EX | Nhap nhanh lien tuc vao o tim kiem | `111 -> 011` | Ket qua khong nhay giat; chi loc theo tu khoa cuoi |
| `TC_US03_UI_01` | UI | Do thanh chip loc va o tim kiem | `001 -> 011` | Chip >= 48dp chieu cao; o nhap >= 48dp; chu >= 14sp |
| `TC_US03_UI_02` | UI | Kiem chip loc khi ten trang thai dai | `011` | Nhan chip khong bi cat cut, khong day lech hang |

### 2.4 · `US04` — Mo tai lieu, du thong tin quyet dinh

**Truy vết:** `P01` → `UC04` → `US04` → Figma `011_*_US04_*` → code `features/review_workspace/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US04_HP_01` | HP | Mo tai lieu tu danh sach cho | `011 -> 202` | Vao khong gian review <= 3 thao tac cham; du 6 khoi thong tin |
| `TC_US04_HP_02` | HP | Doc het khoi AI roi toi thanh quyet dinh | `011` | Thanh quyet dinh dinh day, luon thay 2 nut |
| `TC_US04_AP_01` | AP | Bam Back giua luc doc, chua quyet dinh | `011` | Ve danh sach; khong mat trang thai bo loc da chon |
| `TC_US04_AP_02` | AP | Mo lai cung tai lieu lan hai | `202` | Khong goi lai nguon; doc tu cache; hien gan nhu tuc thi |
| `TC_US04_BV_01` | BV | Tai lieu co 0 phat hien AI | `011` | Khoi AI hien trang thai rong, khong vo bo cuc |
| `TC_US04_BV_02` | BV | Tai lieu co 50 phat hien AI | `011` | Danh sach cuon duoc, khong tran khung, khong lag |
| `TC_US04_EX_01` | EX | Mat mang khi dang mo tai lieu | `202 -> 011` | Hien bang offline; van doc duoc ban cache |
| `TC_US04_EX_02` | EX | Bam dup nut mo tai lieu | `011 -> 111` | Chan bam trung: chi mo 1 man |
| `TC_US04_UI_01` | UI | Do 2 nut quyet dinh va nut Back | `001 -> 011` | Moi nut >= 48x48dp; nhan >= 14sp |
| `TC_US04_UI_02` | UI | Kiem vung bi thanh quyet dinh che | `011` | Noi dung cuoi cuon toi duoc, khong bi che khuat |

### 2.5 · `US05` — Hieu vi sao AI bao loi

**Truy vết:** `P01` → `UC05` → `US05` → Figma `011_*_US05_*` → code `features/ai_result/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US05_HP_01` | HP | Mo ket qua AI cua tai lieu co 7 phat hien | `011 -> 202` | Hien du 7 phat hien, nhom theo muc do, co trich dan |
| `TC_US05_HP_02` | HP | Bam vao 1 phat hien de xem chi tiet | `011` | Hien chi tiet: muc do, vi tri, goi y sua |
| `TC_US05_AP_01` | AP | Loc chi hien 'Goi y' | `111 -> 011` | Chi con muc do Goi y; so dem khop |
| `TC_US05_AP_02` | AP | Doi tu muc do nay sang muc do khac | `111 -> 011` | Bo loc sau thay the bo loc truoc, khong cong don |
| `TC_US05_BV_01` | BV | Tai lieu co 0 phat hien | `011` | Hien trang thai rong 'Khong phat hien van de', khong bieu do trong |
| `TC_US05_BV_02` | BV | Phat hien co trich dan dai 500 ky tu | `011` | Trich dan xuong dong hoac thu nho, khong tran the |
| `TC_US05_EX_01` | EX | Mat mang khi dang xem ket qua AI | `202 -> 011` | Hien bang offline; ket qua AI da tai van xem duoc |
| `TC_US05_EX_02` | EX | Bam nhanh lien tuc giua cac chip loc | `111 -> 011` | Khong ket, khong nhay giat; trang thai cuoi dung |
| `TC_US05_UI_01` | UI | Do chip loc va the phat hien | `001 -> 011` | Chip >= 48dp; the >= 48dp vung cham; chu >= 14sp |
| `TC_US05_UI_02` | UI | Kiem contrast nhan muc do (Loi/Canh bao/Goi y) | `001` | Contrast chu tren nen mau >= 4.5:1 cho ca 3 muc do |

### 2.6 · `US06` — Phe duyet voi it bam nhat

**Truy vết:** `P01` → `UC06` → `US06` → Figma `011_*_US06_*` → code `features/approval/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US06_HP_01` | HP | Bam 'Phe duyet', xac nhan trong hop thoai | `011 -> 111 -> 202` | Tai lieu chuyen trang thai Da phe duyet; co thong bao xac nhan |
| `TC_US06_HP_02` | HP | Phe duyet tai lieu dang o trang thai Cho review | `111 -> 202` | Trang thai cap nhat dung; danh sach phan anh ngay |
| `TC_US06_AP_01` | AP | Bam 'Phe duyet' roi bam 'Huy' trong hop thoai | `011` | Khong co gi thay doi; khong hien thong bao thanh cong |
| `TC_US06_AP_02` | AP | Phe duyet roi mo lai tai lieu | `202 -> 011` | Trang thai van la Da phe duyet; nut quyet dinh doi hanh vi dung |
| `TC_US06_BV_01` | BV | Phe duyet tai lieu da phe duyet truoc do | `111` | Tu choi hoac bao da phe duyet; khong tao ban ghi trung |
| `TC_US06_BV_02` | BV | Phe duyet khi danh sach AI co 50 phat hien | `011 -> 202` | Van phe duyet duoc; khong chan vi so luong phat hien |
| `TC_US06_EX_01` | EX | Mat mang dung luc bam xac nhan phe duyet | `202 -> 011` | Giu trang thai cho; thong bao nho khong che man; tu gui lai khi co mang |
| `TC_US06_EX_02` | EX | Bam dup nut Phe duyet trong hop thoai | `011 -> 111` | Chi phe duyet dung 1 lan; khong sinh 2 ban ghi |
| `TC_US06_UI_01` | UI | Do 2 nut trong thanh quyet dinh | `001 -> 011` | Ca hai >= 48x48dp; nhan >= 14sp; contrast >= 4.5:1 |
| `TC_US06_UI_02` | UI | Kiem thanh quyet dinh co che noi dung khong | `011` | Noi dung cuoi van cuon toi duoc; thanh khong che qua 20% man |

### 2.7 · `US07` — Yeu cau chinh sua va huy duoc

**Truy vết:** `P01` → `UC07` → `US07` → Figma `011_*_US07_*` → code `features/revision_request/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US07_HP_01` | HP | Bam 'Can chinh sua', nhap ly do, xac nhan | `011 -> 111 -> 202` | Trang thai chuyen Can chinh sua; ly do duoc luu va gui cho sinh vien |
| `TC_US07_HP_02` | HP | Gui yeu cau chinh sua voi ly do trong | `111` | Cho phep gui voi ly do mac dinh, hoac bat buoc nhap — hanh vi phai nhat quan va bao ro |
| `TC_US07_AP_01` | AP | Bam 'Can chinh sua' roi bam 'Huy' | `011` | Khong doi trang thai; o nhap ly do duoc xoa |
| `TC_US07_AP_02` | AP | Nhap ly do roi bam ra ngoai hop thoai | `011` | Hop thoai dong; khong luu; xac nhan lai neu nguoi dung lo tay |
| `TC_US07_BV_01` | BV | Ly do dai 1000 ky tu (bien tren) | `111` | Chap nhan hoac bao gioi han ro; khong crash, khong tran o |
| `TC_US07_BV_02` | BV | Ly do chi 1 ky tu | `111` | Chap nhan; khong bao loi vo nghia |
| `TC_US07_EX_01` | EX | Mat mang dung luc gui yeu cau chinh sua | `202 -> 011` | Giu trong hang doi; hien thong bao nho; tu gui lai khi co mang |
| `TC_US07_EX_02` | EX | Bam 'Huy' nhieu lan lien tuc | `011` | Hop thoai dong dung 1 lan; khong bi ket trang thai |
| `TC_US07_UI_01` | UI | Do 2 nut trong hop thoai ('Huy' va xac nhan) | `001 -> 011` | Moi nut >= 48x48dp; nut nguy hiem co mau canh bao ro |
| `TC_US07_UI_02` | UI | Kiem hop thoai khong che het man hinh | `011` | Van thay duoc tai lieu phia sau; hop thoai can giua, khong tran |

### 2.8 · `US08` — So sanh hai phien ban

**Truy vết:** `P01` → `UC08` → `US08` → Figma `011_*_US08_*` → code `features/version_compare/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US08_HP_01` | HP | Mo so sanh phien ban 1 va phien ban 2 | `011 -> 202` | Hien 2 phien ban canh nhau; danh dau cho khac nhau |
| `TC_US08_HP_02` | HP | Cuon xuong xem het phan khac nhau | `011` | Cuon dong bo 2 ben; khong lech hang |
| `TC_US08_AP_01` | AP | Chon so sanh 2 phien ban giong het nhau | `011` | Hien ro 'Khong co khac biet'; khong hien bang trong |
| `TC_US08_AP_02` | AP | Bam Back tu man so sanh | `011` | Ve khong gian review; giu nguyen vi tri da doc |
| `TC_US08_BV_01` | BV | So sanh khi chi co 1 phien ban | `011` | Nut so sanh bi vo hieu hoac bao can it nhat 2 phien ban |
| `TC_US08_BV_02` | BV | Phien ban co 200 dong khac nhau | `011` | Cuon muot; khong lag; khong tran bo nho |
| `TC_US08_EX_01` | EX | Mat mang khi dang tai 2 phien ban | `202 -> 011` | Hien bang offline; neu da co ban cache thi van so sanh duoc |
| `TC_US08_EX_02` | EX | Bam nhanh nhieu lan nut doi phien ban | `111 -> 011` | Khong nhay giat; chi tai phien ban cuoi duoc chon |
| `TC_US08_UI_01` | UI | Do nut doi phien ban | `001 -> 011` | Nut >= 48x48dp; nhan >= 14sp; contrast >= 4.5:1 |
| `TC_US08_UI_02` | UI | Kiem mau danh dau khac nhau khong chi dua vao mau | `011` | Ngoai mau con co ky hieu (dau +/-, nhan) de nguoi mu mau phan biet |

### 2.9 · `US09` — Nop tai lieu cho nhom

**Truy vết:** `P02` → `UC09` → `US09` → Figma `011_*_US09_*` → code `features/document_submit/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US09_HP_01` | HP | Chon tep va bam Nop | `011 -> 111 -> 202` | Nop thanh cong; trang thai doi sang Da nop; co xac nhan |
| `TC_US09_HP_02` | HP | Nop roi mo lai de kiem | `202 -> 011` | Hien dung trang thai Da nop; tep dinh kem con do |
| `TC_US09_AP_01` | AP | Chon nham tep roi chon lai tep khac truoc khi nop | `011` | Tep cu bi thay; chi tep cuoi duoc nop |
| `TC_US09_AP_02` | AP | Nop roi bam 'Nop lai' khi con trong thoi gian cho | `111 -> 202` | Cho phep hoac tu choi ro rang; khong tao 2 ban ghi trung |
| `TC_US09_BV_01` | BV | Nop tep dung 0 byte | `111` | Tu choi voi ly do ro rang; khong tao ban ghi |
| `TC_US09_BV_02` | BV | Nop tep sat gioi han dung luong cho phep | `111 -> 202` | Chap nhan o bien; bao vuot o muc tren bien |
| `TC_US09_EX_01` | EX | Mat mang dung luc bam Nop | `202 -> 011` | Giu trong hang doi; thong bao nho; tu nop lai khi co mang |
| `TC_US09_EX_02` | EX | Bam dup nut Nop | `011 -> 111` | Chi nop dung 1 lan; khong sinh 2 phien ban |
| `TC_US09_UI_01` | UI | Do nut Nop va vung chon tep | `001 -> 011` | Nut >= 48x48dp; nhan >= 14sp; contrast >= 4.5:1 |
| `TC_US09_UI_02` | UI | Kiem ten tep dai trong the dinh kem | `011` | Ten bi cat voi dau '...', khong day lech bo cuc |

### 2.10 · `US10` — Biet vi sao nut nop bi khoa

**Truy vết:** `P02` → `UC10` → `US10` → Figma `011_*_US10_*` → code `features/submit_gate/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US10_HP_01` | HP | Mo man nop khi thieu 1 dieu kien bat buoc | `011 -> 111` | Nut Nop bi khoa; hien ro dieu kien con thieu |
| `TC_US10_HP_02` | HP | Hoan thanh dieu kien thieu roi quay lai | `111 -> 011` | Nut Nop mo khoa ngay; khong can tai lai man |
| `TC_US10_AP_01` | AP | Bam vao dong dieu kien thieu de xem huong dan | `011` | Hien huong dan cu the can lam gi |
| `TC_US10_AP_02` | AP | Bam nut Nop khi dang bi khoa | `011` | Khong co gi xay ra hoac hien ly do; khong nop nham |
| `TC_US10_BV_01` | BV | Thieu 0 dieu kien (du het) | `111 -> 011` | Nut mo khoa; khong con dong canh bao nao |
| `TC_US10_BV_02` | BV | Thieu tat ca dieu kien | `011` | Hien day du danh sach dieu kien thieu; cuon duoc |
| `TC_US10_EX_01` | EX | Mat mang khi dang kiem dieu kien | `202 -> 011` | Dung ket qua cache; neu khong co thi bao chua kiem duoc, khong doan bua |
| `TC_US10_EX_02` | EX | Quay lai va vao lai nhieu lan lien tuc | `011 -> 111` | Trang thai dieu kien tinh dung moi lan; khong sai lech |
| `TC_US10_UI_01` | UI | Do dong dieu kien thieu va nut bi khoa | `001 -> 011` | Dong >= 48dp; nut khoa van hien chu ro, contrast >= 4.5:1 |
| `TC_US10_UI_02` | UI | Kiem trang thai khoa khong chi khac nhau bang mau | `011` | Ngoai mau con co ky hieu o khoa va chu giai thich |

### 2.11 · `US11` — Khong bi ket khi mat mang

**Truy vết:** `P01+P02` → `UC11` → `US11` → Figma `011_*_US11_*` → code `features/*/us11/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US11_HP_01` | HP | Mat mang khi dang dung app | `202 -> 011` | Hien bang offline ro rang; app van dung duoc voi du lieu cache |
| `TC_US11_HP_02` | HP | Co mang tro lai | `202 -> 011` | Bang offline tu an; du lieu tu dong dong bo lai |
| `TC_US11_AP_01` | AP | Nguoi dung bam 'Thu lai' tren bang offline | `202` | Thu ket noi lai; bao ket qua ro rang |
| `TC_US11_AP_02` | AP | Nguoi dung bo qua bang offline va tiep tuc lam | `011` | Bang khong chan thao tac; van lam duoc viec dang lam |
| `TC_US11_BV_01` | BV | Mat mang roi co lai trong 1 giay (nhap nhay) | `202 -> 011` | Bang khong nhap nhay gay roi; co do tre hop ly truoc khi hien |
| `TC_US11_BV_02` | BV | Mat mang keo dai 30 phut | `202 -> 011` | App khong treo, khong tran bo nho; hang doi khong phinh vo han |
| `TC_US11_EX_01` | EX | Thao tac ghi trong luc mat mang | `202` | Vao hang doi; khong mat du lieu; tu gui khi co mang |
| `TC_US11_EX_02` | EX | Mat mang dung luc dang dong bo | `202 -> 011` | Khong tao ban ghi trung; dong bo lai tu diem dung |
| `TC_US11_UI_01` | UI | Do bang offline | `001 -> 011` | Bang khong che nut chinh; chu >= 14sp; contrast >= 4.5:1 |
| `TC_US11_UI_02` | UI | Kiem bang offline khong che vung lam viec | `011` | Vung lam viec chinh van thao tac duoc; bang chi chiem phan dau man |

### 2.12 · `US12` — Thay suc khoe nhom

**Truy vết:** `P01` → `UC12` → `US12` → Figma `011_*_US12_*` → code `features/group_health/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US12_HP_01` | HP | Mo Tong quan xem suc khoe cac nhom | `011 -> 202` | Hien so nhom qua han, dung han; so lieu khop du lieu nguon |
| `TC_US12_HP_02` | HP | Bam vao 1 nhom de xem chi tiet | `011 -> 202` | Mo dung nhom do; khong mat bo loc dang ap |
| `TC_US12_AP_01` | AP | Khong co nhom nao qua han | `011` | Hien trang thai tot; khong hien danh sach trong |
| `TC_US12_AP_02` | AP | Loc chi hien nhom qua han | `111 -> 011` | Danh sach rut gon dung; so dem khop |
| `TC_US12_BV_01` | BV | Dung 0 nhom qua han | `011` | The dem hien '0'; khong vo bo cuc |
| `TC_US12_BV_02` | BV | Co 30 nhom qua han | `011` | Danh sach cuon duoc; khong tran khung; tong ket khop |
| `TC_US12_EX_01` | EX | Mat mang khi dang xem suc khoe nhom | `202 -> 011` | Dung du lieu cache; co bang offline |
| `TC_US12_EX_02` | EX | Du lieu tra ve thieu truong bat buoc | `202 -> 011` | Khong crash; hien 'khong co du lieu' cho truong do |
| `TC_US12_UI_01` | UI | Do the suc khoe nhom | `001 -> 011` | The hien du so, khong cat chu; vung cham >= 48dp |
| `TC_US12_UI_02` | UI | Kiem contrast chi bao do (qua han) | `001` | Contrast >= 4.5:1 cho chu; >= 3:1 cho vien/nut chi bao |

### 2.13 · `US13` — Biet chuan nao dang ap

**Truy vết:** `P01` → `UC13` → `US13` → Figma `011_*_US13_*` → code `features/rule_sets/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US13_HP_01` | HP | Mo khong gian review, xem chu giai chuan dang ap | `011 -> 202` | Hien ten bo chuan va phien ban ngay tai cho ra quyet dinh |
| `TC_US13_HP_02` | HP | Bam vao chu giai de xem chi tiet bo chuan | `011 -> 202` | Mo dung bo chuan; khong roi khoi man review |
| `TC_US13_AP_01` | AP | Tai lieu khong gan bo chuan nao | `011` | Hien ro 'Khong ap bo chuan'; khong hien chu giai trong |
| `TC_US13_AP_02` | AP | Bo chuan da het hieu luc | `011` | Hien ro trang thai het hieu luc, khong hien nhu dang ap |
| `TC_US13_BV_01` | BV | Ten bo chuan dai 100 ky tu | `011` | Khong tran khung; cat voi dau '...' hoac xuong dong |
| `TC_US13_BV_02` | BV | Tai lieu ap 5 bo chuan cung luc | `011` | Hien du 5; cuon duoc; khong chong len nhau |
| `TC_US13_EX_01` | EX | Khong tai duoc thong tin bo chuan | `202 -> 011` | Van ra duoc quyet dinh; hien canh bao chua xac dinh duoc chuan |
| `TC_US13_EX_02` | EX | Bam nhanh lien tuc vao chu giai | `011 -> 202` | Chi mo 1 man chi tiet; khong chong man |
| `TC_US13_UI_01` | UI | Do chu giai va vung cham cua no | `001 -> 011` | Vung cham >= 48dp; chu >= 14sp; contrast >= 4.5:1 |
| `TC_US13_UI_02` | UI | Kiem chu giai khong che thanh quyet dinh | `011` | Thanh quyet dinh van hien day du; khong chong len nhau |

### 2.14 · `US14` — Xem ho so va dang xuat

**Truy vết:** `P01+P02` → `UC14` → `US14` → Figma `011_*_US14_*` → code `features/profile/`

| Mã SKU | Loại | Tình huống kiểm thử | Tầng code | Kết quả mong đợi |
|---|---|---|---|---|
| `TC_US14_HP_01` | HP | Mo tab Ho so, xem thong tin ca nhan | `011 -> 202` | Hien dung ten, vai tro, email, hoc ky |
| `TC_US14_HP_02` | HP | Bam Dang xuat | `011 -> 111 -> 202` | Ve man dang nhap; phien bi xoa; khong quay lai duoc bang Back |
| `TC_US14_AP_01` | AP | Bam Dang xuat roi bam 'Huy' | `011` | Van o man Ho so; khong mat phien |
| `TC_US14_AP_02` | AP | Sau khi dang xuat, mo lai app | `202 -> 011` | Bat dang nhap lai; khong tu vao bang phien cu |
| `TC_US14_BV_01` | BV | Ten nguoi dung dai 60 ky tu | `011` | Khong tran khung; cat hoac xuong dong dung |
| `TC_US14_BV_02` | BV | Ho so thieu truong (vi du chua co hoc ky) | `011` | Hien 'chua cap nhat' cho truong do; khong crash |
| `TC_US14_EX_01` | EX | Mat mang khi dang bam Dang xuat | `202 -> 011` | Dang xuat van thanh cong cuc bo; phien bi xoa tren may |
| `TC_US14_EX_02` | EX | Bam dup nut Dang xuat | `011 -> 111` | Chi dang xuat 1 lan; khong hien 2 man dang nhap |
| `TC_US14_UI_01` | UI | Do nut Dang xuat va cac dong thong tin | `001 -> 011` | Nut >= 48x48dp; nhan >= 14sp; nut nguy hiem co mau canh bao |
| `TC_US14_UI_02` | UI | Kiem vung cham cac cong tac (toggle) trong Ho so | `001 -> 011` | Moi cong tac >= 48x48dp; trang thai bat/tat ro rang ca bang mau va ky hieu |

---

## 3. Ghi chú trung thực

- **140 test case này là THIẾT KẾ, không phải bằng chứng chạy.** Bằng chứng thật hiện có:
  ảnh chụp app chạy trong Chromium ở `ai-output/flutter-app/`, tên file **đã gắn mã TC**
  (`TC_US01_HP_01_dang-nhap-sso-truong.png` … `TC_US14_HP_01_ho-so-giang-vien.png`).
  Sinh bằng `verify/flutter-journeys.mjs` (8/8 bước, 6/6 ảnh khác nhau).
Đo vùng chạm bằng `verify/flutter-tap-targets.mjs`: **8/8 màn, 77 mục, 0 mục < 48dp**.
- **36 test tự động** trong `flutter_app/test/` chạy thật (`flutter test` → 36/36 xanh).
  Trong đó **17 test mới** ở `flutter_app/test/domain_repository_test.dart` đã neo vào mã
  `TC_USxx_*` (US03, US04, US11). 19 test cũ vẫn dùng tên tiếng Việt, **chưa** gắn mã.
- **Độ phủ bằng chứng: 6/140.** Cả 6 ảnh đều thuộc nhóm `HP`. Bốn nhóm còn lại
  (`AP`, `BV`, `EX`, `UI`) hiện **chưa có ảnh chạy** — 134 TC là thiết kế chưa thực thi.
- Phần lớn nhóm `UI` kiểm được tự động (đã có tiền lệ: `test/accessibility_test.dart` đo thật
  `≥48dp`). Các nhóm `HP`/`AP`/`BV`/`EX` hiện chủ yếu kiểm bằng tay vì app không có backend.
- Cột "Tầng code" ghi tầng **sẽ** bị tác động, theo luật import ở `docs/CMPlan-MAP.md` §3.
- `US11` phục vụ cả `P01` và `P02`; `US14` cũng vậy — nên 2 user story này có 2 persona.
