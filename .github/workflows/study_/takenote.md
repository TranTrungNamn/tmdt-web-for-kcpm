**GitHub Actions**

---

# 1. GitHub Actions là gì? Mục đích để làm gì?

**GitHub Actions** là một công cụ **CI/CD (Continuous Integration / Continuous Deployment - Tích hợp liên tục / Triển khai liên tục)** được tích hợp trực tiếp sẵn trong GitHub.

### Mục đích chính:
1. **Tự động hóa các công việc lặp đi lặp lại:** Bạn không cần phải mở máy local lên để gõ `npm test`, `docker build`, `git push deploy` thủ công mỗi lần có thay đổi code.
2. **Kiểm tra chất lượng code (Continuous Integration - CI):** Đảm bảo rằng mọi commit hoặc Pull Request (PR) đẩy lên đều không làm vỡ dự án, không có lỗi cú pháp hay test case bị fail.
3. **Tự động triển khai (Continuous Deployment - CD):** Tự động build dự án và đẩy lên máy chủ (Server, AWS, Vercel, Docker Hub,...) khi code được merge vào nhánh chính (`main`/`master`).

---

# 2. Nguyên lý hoạt động của GitHub Actions

GitHub Actions hoạt động dựa trên cơ chế **Event - Driven (Dựa trên sự kiện)**:

```
[Sự kiện trên GitHub]  --->  [GitHub kích hoạt Workflow]  --->  [Runner khởi chạy VM]  --->  [Thực thi các Jobs/Steps]
 (e.g. git push, PR)           (Đọc file .yml)                     (Ubuntu/Windows)           (Build, Lint, Test, Deploy)
```

### Các thành phần cốt lõi (Core Concepts):
1. **Workflow (`.yml` file):** Là một quy trình tự động được định nghĩa trong thư mục `.github/workflows/`.
2. **Event (`on:`):** Sự kiện kích hoạt workflow. Ví dụ: `push`, `pull_request`, hoặc bấm nút kích hoạt thủ công `workflow_dispatch`.
3. **Jobs:** Một workflow có thể chứa nhiều Jobs (ví dụ: `build-backend`, `test-frontend`). Các Jobs có thể chạy song song hoặc nối tiếp nhau.
4. **Runner (`runs-on:`):** Là một máy chủ ảo (Virtual Machine do GitHub cấp miễn phí như `ubuntu-latest`, `windows-latest`) nhận job và chạy các câu lệnh.
5. **Steps & Actions:** Trong mỗi Job gồm nhiều bước (`steps`). Mỗi bước có thể chạy câu lệnh shell (như `npm test`, `go test`) hoặc dùng sẵn các **Action** do cộng đồng viết (như `actions/checkout@v4`, `actions/setup-node@v4`).

---

# 3. Hướng dẫn (Manual) Cách Kiểm Tra & Test GitHub Actions

*(Dành cho việc kiểm tra workflow mà không cần chạy lệnh test tự động dưới máy local)*

Trong dự án hiện tại của bạn (`TechVie`), bạn đã có các file workflow như backend-ci.yml và frontend-ci.yml.

### BƯỚC 1: Cấu hình kích hoạt thủ công (manual trigger)
Để test thử workflow trên GitHub mà không cần mỗi lần push code, bạn có thể thêm sự kiện `workflow_dispatch` vào đầu file `.yml`:

```yaml
name: Backend CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
  workflow_dispatch: # <-- Thêm dòng này để bấm nút kích hoạt thủ công trên giao diện GitHub UI
```

---

### BƯỚC 2: Thao tác test trên giao diện GitHub Web UI
1. Push file `.yml` lên repository trên **GitHub.com**.
2. Truy cập vào kho chứa (repository) của bạn trên GitHub.
3. Chuyển sang tab **Actions** ở menu phía trên.
4. Ở cột bên trái, chọn Workflow bạn muốn kiểm tra (ví dụ: **Backend CI**).
5. Bạn sẽ thấy một nút **Run workflow** (xuất hiện nhờ dòng `workflow_dispatch`). Bấm nút đó và chọn nhánh cần test -> Nhấn **Run workflow**.

---

### BƯỚC 3: Đọc và kiểm tra nhật ký (Logs)
1. Danh sách các lần chạy (Runs) sẽ xuất hiện. Bấm vào lượt chạy vừa tạo.
2. Click vào từng **Job** để xem trực tiếp các dòng log thực thi từng **Step**.
3. **Kết quả:**
   - **Tích xanh (Success):** Tất cả các bước (Checkout, Build, Test,...) đã vượt qua thành công.
   - **Dấu X đỏ (Failure):** Có bước bị lỗi. Bạn có thể bấm trực tiếp vào bước đỏ đó để xem chi tiết lỗi (ví dụ: thiếu biến môi trường, test case bị sai, thiếu file,...).





---