import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middlewares/auth.middleware";
import { registerUser, loginUser } from "../services/auth.service";
import { registerSchema, loginSchema } from "../validations/auth.validation";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/email.util";

const prisma = new PrismaClient();

/**
 * ĐĂNG KÝ TÀI KHOẢN
 */
export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const newUser = await registerUser(
      validatedData.email,
      validatedData.password,
      validatedData.fullName,
    );

    return res.status(201).json({
      status: "success",
      message: "Đăng ký tài khoản thành công!",
      data: newUser,
    });
  } catch (error: any) {
    if (error.errors) {
      return res
        .status(400)
        .json({ status: "error", message: error.errors[0].message });
    }
    return res.status(400).json({ status: "error", message: error.message });
  }
};

/**
 * ĐĂNG NHẬP
 */
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const { user, token } = await loginUser(
      validatedData.email,
      validatedData.password,
    );

    // Gắn Token vào HttpOnly Cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // "Gia cố" dữ liệu trả về: Đảm bảo fullName không bị null
    const displayUser = {
      ...user,
      fullName: user.fullName || user.email.split("@")[0] || "Thành viên VIP",
    };

    return res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công!",
      token: token,
      data: displayUser,
    });
  } catch (error: any) {
    if (error.errors) {
      return res
        .status(400)
        .json({ status: "error", message: error.errors[0].message });
    }
    return res.status(400).json({ status: "error", message: error.message });
  }
};

/**
 * LẤY THÔNG TIN CÁ NHÂN
 */
export const getMe = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy người dùng!" });
    }

    // Logic xử lý tên trống để Header Frontend luôn hiện đẹp
    const responseData = {
      ...user,
      fullName: user.fullName || user.email.split("@")[0] || "Thành viên VIP",
    };

    return res.status(200).json({
      status: "success",
      data: responseData,
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

/**
 * YÊU CẦU QUÊN MẬT KHẨU
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "Email này chưa được đăng ký!" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    const resetToken = jwt.sign({ email: user.email, id: user.id }, secret, {
      expiresIn: "15m",
    });

    const resetUrl = `http://localhost:3000/reset-password/${user.id}/${resetToken}`;

    // Tên hiển thị trong email
    const displayName =
      user.fullName || user.email.split("@")[0] || "Khách hàng";

    const message = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #333;">Xin chào ${displayName},</h2>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu tại <b>VIP STORE</b>.</p>
        <p>Vui lòng click vào nút bên dưới để tạo mật khẩu mới (Link có hiệu lực trong 15 phút):</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #000; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Đổi Mật Khẩu Ngay</a>
        </div>
        <p style="color: #777; font-size: 12px;">Nếu bạn không yêu cầu hành động này, vui lòng bỏ qua email!</p>
      </div>
    `;

    await sendEmail({
      email: user.email,
      subject: "🔑 Khôi phục mật khẩu VIP STORE",
      message,
    });

    return res.status(200).json({
      status: "success",
      message: "Link khôi phục đã được gửi vào email của bạn!",
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: "Lỗi hệ thống khi gửi email!",
    });
  }
};

/**
 * ĐẶT LẠI MẬT KHẨU MỚI
 */
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id, token } = req.params as { id: string; token: string };
    const { newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User không tồn tại!" });
    }

    const secret = process.env.JWT_SECRET + user.password;
    try {
      jwt.verify(token, secret);
    } catch (err: any) {
      return res.status(403).json({
        status: "error",
        message: "Đường link đã hết hạn hoặc không hợp lệ!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      status: "success",
      message: "Chúc mừng! Sếp đã đổi mật khẩu thành công.",
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Lỗi server!" });
  }
};
