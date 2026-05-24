import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
// Chỉ cần dùng authMiddleware là đủ "đô" rồi Sếp nhé
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// 1. Đăng ký & Đăng nhập
router.post("/register", register);
router.post("/login", login);

// 2. Quên mật khẩu & Đặt lại mật khẩu
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

// 3. Lấy thông tin cá nhân (Dùng cho Header hiển thị tên Sếp)
// Route này được bảo vệ bởi authMiddleware để đảm bảo chỉ người có Token mới vào được
router.get("/me", verifyToken, getMe);

export default router;
