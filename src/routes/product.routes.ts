import express from "express";
import {
  getProducts,
  addProduct,
  addVariant,
  editProduct,
  getProductById, // <-- Đã import thêm hàm này
} from "../controllers/product.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

// AI CŨNG CÓ THỂ XEM: Không cần token, không cần Admin
router.get("/", getProducts);
router.get("/:id", getProductById); // <-- THÊM DÒNG NÀY: Để frontend gọi được trang chi tiết

// CHỈ ADMIN MỚI ĐƯỢC LÀM: Cần cả verifyToken và isAdmin
router.post("/", verifyToken, isAdmin, addProduct);
router.post("/:id/variants", verifyToken, isAdmin, addVariant);
router.patch("/:id", verifyToken, isAdmin, editProduct);

export default router;
