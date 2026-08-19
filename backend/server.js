require("dotenv").config();
// Phải nạp thêm mới hoạt động được
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
// ----

/*
Mục lục
  1. Cấu hình CORS
  2. Cấu hình đọc dữ liệu JSON & URL-encoded & Cookies
  3. Logger Middleware với Chalk
  4. Route mặc định kiểm tra trạng thái hoạt động Backend
  5. Route kiểm tra kết nối database (/test-db)
  6. Authentication Routes (/api/auth)
  7. Products Routes (/api/products)
  8. Categories Routes (/api/categories)
  9. Users Routes (/api/users)
  10. Contacts / Inquiries Routes (/api/contacts)
  11. Orders Routes (/api/orders)
  12. Checkout Routes (/api/checkout)
  13. Search Logs Routes (/api/search)
  14. Reviews Routes (/api/reviews)
  15. Vouchers Routes (/api/vouchers)
  16. Endpoint nhận log từ Client (/api/logs)
  17. Endpoint lấy ảnh Hero Cloudinary (/api/hero-images)
  18. Hàm tự động seed danh mục mặc định
  19. Khởi chạy Server (Kết nối MongoDB trước khi chạy)
*/

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const chalk = require("chalk");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const contactRoutes = require("./routes/contactRoutes");
const orderRoutes = require("./routes/orderRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const searchRoutes = require("./routes/searchRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const voucherRoutes = require("./routes/voucherRoutes");
const Category = require("./models/Category");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// 1. Cấu hình CORS (Cho phép giao diện kết nối không bị chặn)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5173"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    return callback(null, true); // Chấp nhận tất cả origin để tránh lỗi CORS trên Render
  },
  credentials: true
}));

// 2. Cấu hình đọc dữ liệu JSON & URL-encoded & Cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Logger Middleware với Chalk để giao diện console chuyên nghiệp hơn
app.use(
  morgan((tokens, req, res) => {
    const status = tokens.status(req, res);
    const statusColor =
      status >= 500
        ? chalk.red
        : status >= 400
          ? chalk.yellow
          : status >= 300
            ? chalk.cyan
            : chalk.green;

    return [
      chalk.yellow(`[REQUEST]`),
      chalk.gray(new Date().toISOString()),
      chalk.bold(tokens.method(req, res)),
      tokens.url(req, res),
      statusColor(status),
      chalk.gray(`${tokens["response-time"](req, res)} ms`),
    ].join(" ");
  })
);

// 4. Route mặc định kiểm tra trạng thái hoạt động của Backend
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Chào bạn, Backend TechVie đã hoạt động ổn định!",
  });
});

// 5. Route kiểm tra kết nối database
app.get("/test-db", async (req, res) => {
  try {
    // Kiểm tra trạng thái kết nối của Mongoose (1 = Connected)
    const state = mongoose.connection.readyState;
    if (state === 1) {
      res.status(200).json({
        success: true,
        message: "Kết nối Database (MongoDB) thành công!",
        dbName: mongoose.connection.name,
      });
    } else {
      throw new Error(`Trạng thái kết nối: ${state}`);
    }
  } catch (err) {
    logger.error("Lỗi kết nối database:", { error: err.message });
    res.status(500).json({
      success: false,
      message: "Kết nối Database thất bại!",
      error: err.message,
    });
  }
});

// 6. Định nghĩa API Authentication Routes
app.use("/api/auth", authRoutes);

// 7. Định nghĩa API Products Routes (kết nối MongoDB & Cloudinary)
app.use("/api/products", productRoutes);

// 8. Định nghĩa API Categories Routes
app.use("/api/categories", categoryRoutes);

// 9. Định nghĩa API Users Routes (Quản lý thành viên dành cho Admin)
app.use("/api/users", userRoutes);

// 10. Định nghĩa API Contacts / Inquiries Routes
app.use("/api/contacts", contactRoutes);

// 11. Định nghĩa API Orders Routes
app.use("/api/orders", orderRoutes);

// 12. Định nghĩa API Checkout Routes
app.use("/api/checkout", checkoutRoutes);

// 13. Định nghĩa API Search Logs (Phổ biến & Lịch sử)
app.use("/api/search", searchRoutes);

// 14. Định nghĩa API Reviews
app.use("/api/reviews", reviewRoutes);

// 15. Định nghĩa API Vouchers
app.use("/api/vouchers", voucherRoutes);

// 16. Endpoint nhận log từ Client và in ra server log
app.post("/api/logs", (req, res) => {
  const { level, message, details } = req.body;
  
  if (level === 'error') {
    logger.error(`[CLIENT ERROR] ${message}`, details || {});
  } else if (level === 'warn') {
    logger.warn(`[CLIENT WARN] ${message}`, details || {});
  } else {
    logger.info(`[CLIENT LOG] ${message}`, details || {});
  }
  return res.status(200).json({ success: true });
});

// 17. Endpoint GET /api/hero-images truy xuất ảnh từ thư mục wallpaper-slideshow-for-homePage trên Cloudinary
app.get("/api/hero-images", async (req, res) => {
  const fallbackImages = [
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
  ];

  try {
    const cloudinary = require("cloudinary").v2;
    // Kiểm tra cấu hình Cloudinary trước khi gọi
    if (!cloudinary.config().cloud_name) {
      logger.warn("[CLOUDINARY] Chưa được cấu hình! Trả về danh sách ảnh dự phòng.");
      return res.status(200).json(fallbackImages);
    }

    const result = await cloudinary.search
      .expression("folder:wallpaper-slideshow-for-homePage")
      .execute();
    
    if (result && result.resources && result.resources.length > 0) {
      const urls = result.resources.map(r => r.secure_url);
      logger.info(`[CLOUDINARY] Lấy thành công ${urls.length} ảnh từ folder 'wallpaper-slideshow-for-homePage'`);
      return res.status(200).json(urls);
    } else {
      logger.info("[CLOUDINARY] Thư mục 'wallpaper-slideshow-for-homePage' trống hoặc không tìm thấy ảnh. Sử dụng ảnh dự phòng.");
      return res.status(200).json(fallbackImages);
    }
  } catch (error) {
    logger.error("Lỗi khi lấy danh sách ảnh từ Cloudinary:", { error: error.message });
    return res.status(200).json(fallbackImages);
  }
});

// 18. Hàm tự động seed danh mục mặc định nếu trống
async function seedDefaultCategories() {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      const defaultCategories = [
        { name: "Điện thoại" },
        { name: "Laptop" },
        { name: "Đồng hồ" },
        { name: "Âm thanh" },
        { name: "Bàn phím" },
        { name: "Combo" },
        { name: "Phụ kiện" }
      ];
      await Category.insertMany(defaultCategories);
      logger.info("[SEED] Đã tự động chèn các danh mục mặc định vào database!");
    } else {
      logger.info("[SEED] Danh mục đã tồn tại trong database, không cần seed.");
    }
  } catch (error) {
    logger.error("Lỗi tự động seed danh mục:", { error: error.message });
  }
}

// 19. Khởi chạy Server (Kết nối MongoDB trước khi chạy)
connectDB().then(async (conn) => {
  if (conn) {
    await seedDefaultCategories();
  } else {
    logger.warn("[DATABASE] Không có kết nối Database, bỏ qua seed danh mục mặc định.");
  }

  app.listen(PORT, () => {
    logger.info(`[SERVER] Server đang chạy tại http://localhost:${PORT}`);
    if (conn) {
      logger.info(`[DATABASE] Máy chủ Database: ${mongoose.connection.host}`);
      logger.info(`[DATABASE] Tên Database đang sử dụng: ${mongoose.connection.name}`);
    } else {
      logger.error(`[DATABASE] Kết nối Database thất bại hoặc chưa sẵn sàng!`);
    }
    logger.info(`[DATABASE] Trạng thái kết nối Mongoose: ${mongoose.connection.readyState}`);

    // Báo cáo cấu hình môi trường (.env)
    if (process.env.MONGODB_URI) {
      let hostInfo = "Đã cấu hình";
      try {
        const urlParts = process.env.MONGODB_URI.split("@");
        if (urlParts.length > 1) {
          hostInfo = urlParts[urlParts.length - 1].split("?")[0];
        }
      } catch (e) {}
      logger.info(`[ENV] MONGODB_URI: ${hostInfo} (Đã ẩn thông tin đăng nhập & mật khẩu)`);
    } else {
      logger.error("[ENV] MONGODB_URI: CHƯA ĐỊNH NGHĨA hoặc trống!");
    }

    if (process.env.JWT_SECRET) {
      logger.info("[ENV] JWT_SECRET: Đã cấu hình (Được mã hóa bảo mật)");
    } else {
      logger.error("[ENV] JWT_SECRET: CHƯA ĐỊNH NGHĨA hoặc trống!");
    }

    const cloudinary = require("cloudinary").v2;
    const cloudConfig = cloudinary.config();
    if (cloudConfig.cloud_name && cloudConfig.api_key && cloudConfig.api_secret) {
      logger.info(`[ENV] CLOUDINARY: Đã kết nối với Cloud: ${cloudConfig.cloud_name}`);
    } else {
      logger.error("[ENV] CLOUDINARY: Thiếu CLOUDINARY_CLOUD_NAME, API_KEY hoặc API_SECRET!");
    }

    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI) {
      logger.info(`[ENV] GOOGLE OAUTH2: Đã cấu hình. Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 15)}...`);
    } else {
      logger.warn("[ENV] GOOGLE OAUTH2: Chưa cấu hình đầy đủ (Đăng nhập bằng Google sẽ không hoạt động)");
    }

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      logger.info(`[ENV] SMTP EMAIL: Đã cấu hình với tài khoản ${process.env.EMAIL_USER}`);
    } else {
      logger.warn("[ENV] SMTP EMAIL: Chưa cấu hình EMAIL_USER & EMAIL_PASS (Sẽ tự động in mã xác thực/đổi mật khẩu ra Terminal)");
    }
  });
});