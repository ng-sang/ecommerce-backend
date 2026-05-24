import express from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Sử dụng upload.single('image') để báo cho server biết: "Chỉ nhận 1 file duy nhất từ ô có tên là 'image'"
router.post("/", verifyToken, upload.single("image"), uploadImage);

export default router;
