import express from "express";
import { addBrand, getBrands } from "../controllers/brand.controller";
import { verifyToken, isAdmin } from "../middlewares/auth.middleware";

const router = express.Router();

// Khách hàng xem hãng
router.get("/", getBrands);

// Admin tạo hãng mới
router.post("/", verifyToken, isAdmin, addBrand);

export default router;
