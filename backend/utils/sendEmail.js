const nodemailer = require("nodemailer");
const logger = require("./logger");

/**
 * Gửi email sử dụng Nodemailer
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  // 1. Bypass (Mock) Gửi mail nếu không phải môi trường Production (ví dụ: đang test ở máy Local)
  if (process.env.NODE_ENV !== 'production') {
    logger.info(`[MOCK EMAIL] Bypass gửi mail thật...`);
    logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    // In nội dung HTML ra terminal (có thể rất dài nên bạn chú ý)
    logger.info(`[MOCK EMAIL] Content: \n${html}\n===============================`);
    
    // Trả về một kết quả giả lập để các hàm phía sau không bị lỗi
    return { messageId: 'mock-message-id-' + Date.now() };
  }

  // 2. Chạy thật nếu ở môi trường Production (Deploy thật)
  // Nếu chưa cấu hình EMAIL_USER hoặc EMAIL_PASS trên môi trường Render, bypass để tránh timeout kết nối SMTP
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn(`[EMAIL BYPASS] Thiếu EMAIL_USER hoặc EMAIL_PASS trên Server, chuyển sang mock mode để tránh timeout.`);
    return { messageId: 'mock-message-id-' + Date.now() };
  }

  // Cấu hình transporter - sử dụng Gmail SMTP (kèm timeout 10 giây để không bao giờ bị nghẽn socket)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Email gửi đi (vd: noreply@techvie.com)
      pass: process.env.EMAIL_PASS,   // App Password của Gmail
    },
    connectionTimeout: 10000, // 10s
    greetingTimeout: 10000,   // 10s
    socketTimeout: 10000,     // 10s
  });

  const mailOptions = {
    from: `"TechVie Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  logger.info(`[EMAIL] Đã gửi email đến ${to} — Message ID: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
