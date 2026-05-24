import express from "express";
import { addToCart, viewCart } from "../controllers/cart.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Lấy thông tin giỏ hàng của tôi
router.get("/", verifyToken, viewCart);

// Thêm hàng vào giỏ
router.post("/", verifyToken, addToCart);

export default router;
