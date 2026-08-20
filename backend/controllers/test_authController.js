const crypto = require("crypto");
const User = require("../models/User");

const test_authController = {
  // TEST ONLY - Tạo Reset Token với tuổi giả lập cho Automation BVA
  setResetTokenTimeForTest: async (req, res) => {
    try {
      const { email, elapsedSeconds } = req.body;
      const seconds = Number(elapsedSeconds);

      if (
        !email ||
        elapsedSeconds === undefined ||
        !Number.isFinite(seconds) ||
        seconds < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Thiếu hoặc sai email/elapsedSeconds",
        });
      }

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      const lifetimeSeconds = 15 * 60;
      const remainingSeconds = lifetimeSeconds - seconds;
      const resetPasswordExpire = new Date(
        Date.now() + remainingSeconds * 1000
      );

      await User.updateById(user.id, {
        resetPasswordToken: hashedToken,
        resetPasswordExpire,
      });

      return res.status(200).json({
        success: true,
        resetToken,
        elapsedSeconds: seconds,
        remainingSeconds,
        resetPasswordExpire,
      });
    } catch (error) {
      console.error("Lỗi setup Reset Token test:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },

  // TEST ONLY - Tạo Verification Token với tuổi giả lập cho Automation BVA
  setVerificationTokenTimeForTest: async (req, res) => {
    try {
      const { email, elapsedSeconds } = req.body;
      const seconds = Number(elapsedSeconds);

      if (
        !email ||
        elapsedSeconds === undefined ||
        !Number.isFinite(seconds) ||
        seconds < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Thiếu hoặc sai email/elapsedSeconds",
        });
      }

      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      const verificationToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      const lifetimeSeconds = 24 * 60 * 60;
      const remainingSeconds = lifetimeSeconds - seconds;
      const emailVerificationExpire = new Date(
        Date.now() + remainingSeconds * 1000
      );

      await User.updateById(user.id, {
        isEmailVerified: false,
        emailVerificationToken: hashedToken,
        emailVerificationExpire,
      });

      return res.status(200).json({
        success: true,
        verificationToken,
        elapsedSeconds: seconds,
        remainingSeconds,
        emailVerificationExpire,
      });
    } catch (error) {
      console.error("Lỗi setup Verification Token test:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = test_authController;
