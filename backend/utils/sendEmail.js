const nodemailer = require("nodemailer");
const logger = require("./logger");

/**
 * Gửi email sử dụng Nodemailer
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  logger.info("[SEND_EMAIL_INVOKED]", {
    nodeEnv: process.env.NODE_ENV,
    emailService: process.env.EMAIL_SERVICE || "gmail",
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPass: !!process.env.EMAIL_PASS,
  });

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
  // Cấu hình transporter - sử dụng Gmail SMTP (hoặc dịch vụ khác qua biến môi trường)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // Email gửi đi (vd: noreply@techvie.com)
      pass: process.env.EMAIL_PASS,   // App Password của Gmail
    },
  });

  const mailOptions = {
    from: `"TechVie Shop" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  const startTime = Date.now();
  logger.info("[SEND_EMAIL_START] Bắt đầu gọi transporter.sendMail()", {
    startTime: new Date(startTime).toISOString(),
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    const durationMs = Date.now() - startTime;
    logger.info(`[EMAIL] Đã gửi email đến ${to} — Message ID: ${info.messageId}`, {
      durationMs,
      messageId: info.messageId,
    });
    return info;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("[SEND_EMAIL_ERROR] Lỗi khi thực thi transporter.sendMail()", {
      durationMs,
      code: error.code,
      message: error.message,
      command: error.command,
      responseCode: error.responseCode,
    });
    throw error;
  }
};

module.exports = sendEmail;
