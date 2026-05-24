import dotenv from "dotenv";
dotenv.config();
import path from "path";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http"; // Bổ sung thư viện http của Node.js

// Import Routes
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import brandRoutes from "./routes/brand.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import uploadRoutes from "./routes/upload.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";

// Import Utils (Socket & Redis)
import { initSocket } from "./utils/socket";
// import { connectRedis } from "./utils/redis";

const app = express();
const httpServer = createServer(app); // Bọc Express bằng HTTP Server

// Khởi tạo Socket.io
initSocket(httpServer);

// Khởi tạo Redis
// connectRedis();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

app.get("/api/health", (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "success", message: "🚀 Server siêu tốc đã chạy!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

// CHÚ Ý: Chạy httpServer.listen thay vì app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(
    `👉 Bạn có thể test thử tại: http://localhost:${PORT}/api/health`,
  );
});
