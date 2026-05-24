import { Router } from "express";
import * as AdminController from "../controllers/admin.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = Router();

// 1. Route công khai (Không cần Admin mới xem được)
// Sếp có thể dùng route này cho cả khách hàng xem sản phẩm
router.get("/products", AdminController.fetchAllProducts);

// 2. Các route cần quyền Admin (Phải đăng nhập + là Admin)
router.use(verifyToken, isAdmin);

// Dashboard
router.get("/dashboard", AdminController.getDashboard);

// Quản lý sản phẩm (Admin mới được thêm/xóa)
router.post("/products", AdminController.addProduct);
router.delete("/products/:id", AdminController.removeProduct);
router.put("/products/:id", AdminController.updateProduct);
// Đơn hàng
router.get("/orders", AdminController.fetchAllOrders);
router.patch("/orders/:orderId/status", AdminController.changeOrderStatus);

export default router;
