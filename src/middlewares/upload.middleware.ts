import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Cấu hình kết nối với Cloudinary bằng 3 key Sếp vừa thêm trong .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Tạo kho lưu trữ trên mây
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "VIP_STORE_IMAGES", // Ảnh sẽ được lưu vào thư mục này trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
});

// 3. Xuất ra biến upload để bên routes sử dụng
export const upload = multer({ storage });
