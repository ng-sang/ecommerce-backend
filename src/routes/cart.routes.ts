import express from "express";
import { addToCart, viewCart } from "../controllers/cart.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Lấy thông tin giỏ hàng của tôi
router.get("/", verifyToken, viewCart);

// Thêm hàng vào giỏ
router.post("/", verifyToken, addToCart);

export default router;
