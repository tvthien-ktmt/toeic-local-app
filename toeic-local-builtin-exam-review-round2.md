# TOEIC Local App — Built-in Exam Library: Tổng hợp vấn đề còn lại sau đợt fix Pattern 1-3

> Ghi nhận: đợt fix vừa rồi (Pattern 1: format bold `**131.**`, Pattern 2: điều tra 2 test lỗi nặng, Pattern 3: header dồn cục ETS 2020) là **thật, có bằng chứng grep xác nhận cụ thể**, đã tăng từ 87 → 113/155 test đạt 100/100 câu. Đáng ghi nhận vì lần này có tự grep xác minh trước khi báo cáo như yêu cầu. Dưới đây là những gì CÒN LẠI cần xử lý tiếp.

---

## 🔴 A. Bug hạ tầng — `.gitignore` sai đường dẫn, file DB có nguy cơ lọt vào repo public

**Phát hiện:** `.gitignore` hiện có dòng `backend/data/toeic.db`, nhưng file database thực tế đang nằm ở `backend/toeic.db` (khác đường dẫn, thiếu thư mục con `/data/`). Do sai đường dẫn, `.gitignore` không loại trừ được file này — hiện đã có 1 file `backend/toeic.db` (dù đang rỗng 0 byte) bị commit vào repo public. Nếu không sửa, **lần chạy ingest tiếp theo có nguy cơ đẩy nhầm toàn bộ database chứa nội dung sách bản quyền lên GitHub công khai**.

**Yêu cầu:**
1. Sửa `.gitignore` cho đúng đường dẫn thật của file DB đang dùng (`backend/toeic.db`, hoặc đổi lại code để DB thật sự nằm ở `backend/data/toeic.db` cho khớp với `.gitignore` đã có — chọn 1 trong 2, miễn nhất quán).
2. Chạy `git rm --cached backend/toeic.db` để gỡ file đã lỡ commit ra khỏi tracking (không xoá file thật trên máy, chỉ gỡ khỏi git).
3. Kiểm tra lại toàn bộ repo xem có file `.db` nào khác bị lọt vào lịch sử commit trước đó không (`git log --all --full-history -- "*.db"`), báo cáo nếu có.
4. **Nhắc lại khuyến nghị cũ:** chuyển repo sang Private trên GitHub càng sớm càng tốt, vì nội dung `textbook/` (sách ETS/YBM/Hacker/Xanh Cam có bản quyền) đã nằm trong repo từ trước.

---

## 🟠 B. Bug parser mới — câu hỏi Part 6 dạng "điền từ" có đáp án tách rời khỏi đề bài vẫn bị bỏ sót

**Bằng chứng cụ thể:** Câu 138 trong `ETS 2017 RC.md` có format sạch, không lỗi OCR:
```
138. (A) reduced
(B) reduces
(C) reducing
(D) reduces
```
Text này tồn tại nguyên vẹn (đã tự grep xác nhận), nhưng vẫn bị báo cáo "thiếu" ở nhiều test (ETS 2017 Test 01/02/03/05, ETS 2018 Test 02/03/04/05, ETS 2019 Test 01/02/04/05/07...) — luôn đúng những câu ở CUỐI Part 6 (138, 142, 145, 146...).

**Giả thuyết cần kiểm tra:** Đây là dạng câu hỏi Part 6 "điền từ vào đoạn văn" — phần NGỮ CẢNH câu hỏi (đoạn văn chứa chỗ trống) nằm TRƯỚC, tách biệt khỏi vị trí "138. (A)(B)(C)(D)" (khác với Part 5, nơi câu hỏi + 4 đáp án luôn liền kề nhau). Có thể parser hiện tại đang yêu cầu "câu hỏi + 4 đáp án phải nằm liền kề trong 1 khối" mới coi là hợp lệ, nên bỏ qua các câu Part 6 dạng này dù đáp án có tồn tại.

**Yêu cầu:**
1. In ra đoạn text đầy đủ quanh câu 138 trong `ETS 2017 RC.md` (rộng hơn, lấy cả đoạn văn phía trước chứa chỗ trống, không chỉ đoạn "138. (A)...") — xác nhận cấu trúc thật của câu hỏi Part 6 dạng này.
2. Nếu đúng là parser đang từ chối các câu có 4 đáp án nhưng không tìm thấy "câu hỏi liền kề", cần sửa: với Part 6, chấp nhận trường hợp CHỈ cần tìm thấy đúng số thứ tự + 4 đáp án hợp lệ là đủ để lưu — phần "câu hỏi/ngữ cảnh" với Part 6 vốn dĩ nằm trong đoạn văn chung của cả nhóm câu (đã có ở đầu block Part 6 rồi), không cần lặp lại riêng cho từng câu.
3. Sau khi sửa, chạy lại ingest, kiểm tra riêng các test đang bị lỗi do pattern này (danh sách nêu trên) xem có lên 100/100 không.

---

## 🟡 C. Việc còn lại: xác minh 2 test lỗi nặng đã giải thích có đúng là do nguồn, không phải parser

- **ETS 2022 Test 11 (giờ chỉ còn ghi nhận là "thừa/không phải đề thật"):** đồng ý với kết luận nếu đúng là sách gốc chỉ có 10 Test — nhưng cần: **loại bỏ hẳn Test 11 này khỏi danh sách hiển thị cho người dùng** (không để 1 "đề" chỉ có 5 câu xuất hiện trong thư viện, gây nhầm lẫn), thay vì để nó tồn tại như 1 entry lỗi.
- **YBM Vol 2 Test 09 (71/100, thiếu Part 5 câu 101-134 ngay từ nguồn):** nếu đúng là bản thân file `.md` gốc thiếu (đã convert từ đầu là thiếu, không phải lỗi parser) — đánh dấu rõ ràng trong DB (`parse_status = 'source_incomplete'`) và **hiển thị cảnh báo cho người dùng khi chọn test này** ("Đề này thiếu 1 phần Part 5 do lỗi nguồn, chỉ có X/100 câu"), thay vì để người dùng làm bài thi thiếu mà không biết.

---

## 🟢 D. Việc chuẩn hoá cuối cùng — chạy lại full audit có grep-verify

Sau khi sửa xong A và B, chạy lại toàn bộ 155 test 1 lần cuối, và với MỌI test còn báo thiếu câu, bắt buộc **tự grep xác minh** đúng như yêu cầu trước:
- Nếu grep tìm thấy text câu đó trong file gốc → đây vẫn là lỗi parser, phải tiếp tục điều tra, KHÔNG được kết luận "do nguồn".
- Nếu grep KHÔNG tìm thấy → mới được kết luận là do file nguồn, đánh dấu `source_incomplete` cho test đó.

**DoD cuối cùng:**
- [ ] Dán bảng thống kê mới sau khi sửa A+B: tổng số test 100/100, tổng số test còn thiếu (kỳ vọng giảm mạnh so với 42 hiện tại, vì lỗi Part 6 dạng B nêu trên xuất hiện rất nhiều lần).
- [ ] Với MỌI test còn thiếu sau vòng này, liệt kê kèm bằng chứng grep (tìm thấy trong nguồn hay không) — không liệt kê suông như trước.
- [ ] Xác nhận `.gitignore` đã sửa đúng, `backend/toeic.db` đã gỡ khỏi git tracking.
- [ ] Xác nhận ETS 2022 "Test 11" không còn hiển thị trong danh sách chọn đề của người dùng.
