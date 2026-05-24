import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): any => {
  // req.user đã được gán giá trị từ middleware 'protect' trước đó
  if (req.user && req.user.role === "ADMIN") {
    next(); // Cho phép đi tiếp
  } else {
    return res.status(403).json({
      status: "error",
      message: "Quyền truy cập bị từ chối. Bạn không phải là Admin!",
    });
  }
};
