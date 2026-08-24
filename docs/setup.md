# 🛠️ HƯỚNG DẪN THIẾT LẬP MÔI TRƯỜNG & CHẠY DỰ ÁN (SETUP GUIDE)

Tài liệu này cung cấp danh sách phiên bản công nghệ, thư viện phụ thuộc và các bước thiết lập chi tiết để thành viên trong nhóm có thể kéo (pull) mã nguồn về và vận hành ứng dụng TechVie trên máy cá nhân một cách đồng bộ.

---

## 📌 1. YÊU CẦU PHẦN MỀM HỆ THỐNG (SYSTEM PREREQUISITES)

| Thành phần | Phiên bản khuyến nghị | Ghi chú |
| :--- | :--- | :--- |
| **Node.js** | `>= 20.x` hoặc `v22.x` (LTS) | Kiểm tra bằng: `node -v` |
| **npm** | `>= 10.x` | Kiểm tra bằng: `npm -v` |
| **Database** | MongoDB Atlas Cloud hoặc Local Mongo `>= 6.0` | Cần chuỗi kết nối `MONGODB_URI` |
| **Trình duyệt** | Google Chrome (Phiên bản mới nhất) | Dùng để chạy ứng dụng và kiểm thử Cypress E2E |

---

## 📦 2. DANH MỤC THƯ VIỆN & PHIÊN BẢN (DEPENDENCY VERSIONS)

Tất cả các phiên bản chính xác đã được khóa cố định trong **`package.json`** và **`package-lock.json`** tại từng thư mục:

### 🔹 A. Backend (`backend/package.json` - Node.js CommonJS):
* **Core Framework**: `express` (`^5.2.1`)
* **Database ODM**: `mongoose` (`^9.7.1`)
* **Bảo mật & Xác thực**: `jsonwebtoken` (`^9.0.3`), `bcryptjs` (`^3.0.3`), `cookie-parser` (`^1.4.7`)
* **Email & Cloud Media**: `nodemailer` (`^6.9.16`), `cloudinary` (`^1.41.3`), `multer` (`^2.2.0`), `@imagekit/nodejs` (`^7.10.0`)
* **Logging & Validation**: `winston` (`^3.19.0`), `morgan` (`^1.11.0`), `express-validator` (`^7.3.2`), `dotenv` (`^17.4.2`), `cors` (`^2.8.6`)

### 🔹 B. Frontend (`frontend/package.json` - React 19 + Vite):
* **Core UI Engine**: `react` (`^19.0.1`), `react-dom` (`^19.0.1`)
* **Build Tool & Routing**: `vite` (`^6.2.3`), `react-router-dom` (`^7.18.1`), `tsx` (`^4.21.0`), `typescript` (`~5.8.2`)
* **Styling & Icons**: `@tailwindcss/vite` (`^4.1.14`), `tailwindcss` (`^4.1.14`), `lucide-react` (`^0.546.0`), `motion` (`^12.23.24`), `react-hot-toast` (`^2.6.0`)
* **Export Utilities**: `xlsx` (SheetJS), `jszip` (`^3.10.1`)
* **Testing & Coverage Engine**:
  * `cypress` (`^15.x`)
  * `cypress-mochawesome-reporter` (`^5.0.0`)
  * `vite-plugin-istanbul` (`^6.0.2`)
  * `@cypress/code-coverage` (`^4.0.3`)

---

## 🚀 3. CÁC BƯỚC THIẾT LẬP VÀ VẬN HÀNH (STEP-BY-STEP SETUP)

### Bước 1: Cài đặt Dependencies cho cả 2 phía

Mở Terminal tại thư mục gốc của dự án:

```powershell
# 1. Cài đặt thư viện Backend
cd backend
npm install

# 2. Cài đặt thư viện Frontend
cd ../frontend
npm install
```

---

### Bước 2: Cấu hình biến môi trường (`.env`)

#### 1. Tạo file `backend/.env` (tham khảo cấu trúc):
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/testing?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
CLIENT_URL=http://localhost:3000
```

#### 2. Tạo file `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000
PORT=3000
```

---

### Bước 3: Khởi chạy ứng dụng

Mở 2 cửa sổ Terminal riêng biệt:

#### 🟢 Cửa sổ 1 (Khởi động Backend):
```powershell
cd backend
npm run dev
# Hoặc: node server.js
# Backend lắng nghe tại: http://localhost:5000
```

#### 🔵 Cửa sổ 2 (Khởi động Frontend):
```powershell
cd frontend
npm run dev
# Frontend truy cập tại: http://localhost:3000
```

---

## 🧪 4. HƯỚNG DẪN THIẾT LẬP & CHẠY TEST (CHO THÀNH VIÊN TESTER)

Dành cho thành viên phụ trách viết kịch bản hoặc chạy kiểm thử:

### 1. Mở giao diện Cypress trực quan (Interactive GUI):
```powershell
cd frontend
npx cypress open
```
* Chọn **E2E Testing** -> Chọn **Chrome** -> Bấm **Start E2E Testing**.

### 2. Chạy tự động toàn bộ Test Suite trên Terminal (Headless CLI):
```powershell
cd frontend
npx cypress run
```

### 3. Xem báo cáo kết quả:
* **Báo cáo Test Execution**: Mở file `frontend/cypress/reports/index.html`
* **Báo cáo Độ bao phủ dòng lệnh (Coverage)**: Mở file `frontend/coverage/lcov-report/index.html`
