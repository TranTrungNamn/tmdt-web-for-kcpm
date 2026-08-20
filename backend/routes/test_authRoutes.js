const express = require("express");
const router = express.Router();
const test_authController = require("../controllers/test_authController");

// Middleware bảo vệ tập trung cho toàn bộ Test Routes:
// Tự động chặn khi ở môi trường Production VÀ không bật cờ ENABLE_TEST_ROUTES
router.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_TEST_ROUTES !== "true"
  ) {
    return res.status(404).json({
      success: false,
      message: "Not found",
    });
  }
  next();
});

// TEST ONLY - Automation BVA time boundaries
router.post(
  "/set-reset-token-time",
  test_authController.setResetTokenTimeForTest
);

router.post(
  "/set-verification-token-time",
  test_authController.setVerificationTokenTimeForTest
);

module.exports = router;
