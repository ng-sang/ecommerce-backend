import express from "express";
import {
  placeOrder,
  getMyOrders,
  manageAllOrders,
  changeOrderStatus,
  createPaymentUrl,
  vnpayReturn,
} from "../controllers/order.controller.js";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware.js";

// ==========================================
// 🔍 MÁY QUÉT TÌM LỖI UNDEFINED CỦA HỆ THỐNG
// ==========================================
console.log("👉 ĐANG KIỂM TRA CÁC HÀM TRONG ORDER ROUTE:");
console.log("- placeOrder:", !!placeOrder);
console.log("- getMyOrders:", !!getMyOrders);
console.log("- manageAllOrders:", !!manageAllOrders);
console.log("- changeOrderStatus:", !!changeOrderStatus);
console.log("- createPaymentUrl:", !!createPaymentUrl);
console.log("- vnpayReturn:", !!vnpayReturn);
console.log("- verifyToken:", !!verifyToken);
console.log("- isAdmin:", !!isAdmin);
console.log("==========================================");
// Nếu Terminal in ra dòng nào là 'false', thì chính hàm đó đang bị lỗi/viết sai tên ở Controller hoặc Middleware!

const router = express.Router();

// PUBLIC ROUTES: Nhận kết quả từ ngân hàng VNPAY
router.get("/vnpay_return", vnpayReturn);

// PRIVATE ROUTES: Dành cho người dùng mua sắm
router.post("/", verifyToken, placeOrder);
router.get("/my-orders", verifyToken, getMyOrders);
router.get("/:id/payment", verifyToken, createPaymentUrl);
router.get("/my-orders", verifyToken, getMyOrders);
// ADMIN ROUTES: Quản lý đơn hàng
router.get("/admin/all", verifyToken, isAdmin, manageAllOrders);
router.patch("/:id/status", verifyToken, isAdmin, changeOrderStatus);

export default router;
