import express from "express";
import { addCategory, getCategories } from "../controllers/category.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

// Khách hàng xem danh sách
router.get("/", getCategories);

// Admin tạo danh mục mới
router.post("/", verifyToken, isAdmin, addCategory);

export default router;
