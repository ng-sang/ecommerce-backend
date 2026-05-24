import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Mở rộng Request của Express để nhét thêm thông tin user vào
export interface AuthRequest extends Request {
  user?: any;
}

/**
 * MIDDLEWARE XÁC THỰC TOKEN CHÍNH (Đã đồng bộ sang nhận Bearer Token từ Header)
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  // 1. Lấy token từ header "Authorization: Bearer <token>" do Axios Frontend gửi lên
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  // Nếu không tìm thấy Token ở Header, bới thêm ở Cookie phòng hờ cho Sếp
  const fallbackToken = token || req.cookies?.token || req.cookies?.jwt;

  if (!fallbackToken) {
    return res.status(401).json({
      status: "error",
      message: "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn!",
    });
  }

  try {
    // 2. Đọc khóa bí mật (Tự động dùng chuỗi dự phòng nếu file .env chưa load kịp)
    const secretKey =
      process.env.JWT_SECRET || "VIP_STORE_SUPER_SECRET_KEY_2026";

    // 3. Nhờ jwt giải mã xem thẻ này có phải hàng thật không
    const decoded = jwt.verify(fallbackToken, secretKey);

    // 4. Gắn thông tin user (id, role) vào Request để các Controller phía sau dùng được
    req.user = decoded;

    next(); // Kêu cửa mở cho đi tiếp
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Token không hợp lệ hoặc đã hết hạn!",
    });
  }
};

/**
 * MIDDLEWARE KIỂM TRA QUYỀN ADMIN
 */
export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  if (req.user && req.user.role === "ADMIN") {
    next(); // Là Admin thì cho đi tiếp
  } else {
    return res.status(403).json({
      status: "error",
      message:
        "Quyền truy cập bị từ chối! Tính năng này chỉ dành riêng cho Admin.",
    });
  }
};
