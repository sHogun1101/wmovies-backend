require("dotenv").config;
const express = require("express");
const router = express.Router();
const cors = require("cors");
const cookieParser = require("cookie-parser");
router.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://wmovies.tech"],
  })
);
router.use(cookieParser());
const blacklist = [];
const resetPasswordController = require("../services/resetPasswordController");
const authencationController = require("../services/authencationController");
// Middleware để kiểm tra tính hợp lệ của JWT
function checkToken(req, res, next) {
  const token = req.body.dataReset.token;
  // Kiểm tra xem JWT có nằm trong danh sách đen hay không
  if (blacklist.includes(token)) {
    return res.status(401).json({ message: "JWT không hợp lệ" });
  }
  next();
}
// Send mail reset Password
router.post("/send-email-user", resetPasswordController.sendMailUser);
// Check token link reset
router.post("/check-email-token", resetPasswordController.checkMailToken);
// Check login google
router.post(
  "/check-user-login-google",
  authencationController.loginUserWithGoogle
);
// Reset password
router.post(
  "/reset-password",
  checkToken,
  resetPasswordController.resetPassword
);
// Login User
router.post("/login-user", authencationController.loginUser);
// Get User Info
router.get("/get-user", authencationController.getUser);
// Update Info User
router.post("/update-user-client", authencationController.updateInfoUser);
// Login Admin
router.post("/login-admin", authencationController.loginAdmin);
// Get Admin Info
router.get("/get-admin", authencationController.getAdmin);
// Update Info Admin
router.post("/change-password-admin", authencationController.updateInfoAdmin);
module.exports = router;
