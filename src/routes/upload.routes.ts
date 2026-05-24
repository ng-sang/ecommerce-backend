import express from "express";
import { uploadImage } from "../controllers/upload.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyToken } from "../middlewares/auth.middleware";

const router = express.Router();

// Sử dụng upload.single('image') để báo cho server biết: "Chỉ nhận 1 file duy nhất từ ô có tên là 'image'"
router.post("/", verifyToken, upload.single("image"), uploadImage);

export default router;
