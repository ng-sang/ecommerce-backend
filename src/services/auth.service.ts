import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/password.util";
import jwt from "jsonwebtoken";
import { comparePassword } from "../utils/password.util";
const prisma = new PrismaClient();

export const registerUser = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  // 1. Kiểm tra xem email đã tồn tại trong DB chưa
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email này đã được sử dụng!");
  }

  // 2. Mã hóa mật khẩu
  const hashedPassword = await hashPassword(password);

  // 3. Tạo User mới trong DB
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      fullName,
    },
  });

  // Trả về thông tin user (loại bỏ password để bảo mật)
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

//  hàm loginUser
export const loginUser = async (email: string, password: string) => {
  // 1. Kiểm tra email có tồn tại không
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Email không tồn tại trong hệ thống!");
  }

  // 2. So sánh mật khẩu khách nhập với mật khẩu đã băm trong DB
  const isPasswordMatch = await comparePassword(password, user.password);

  if (!isPasswordMatch) {
    throw new Error("Mật khẩu không chính xác!");
  }

  // 3. Tạo JWT Token (thẻ chứng minh thư điện tử)
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }, // Token sống được 1 ngày
  );

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};
// 1. Hàm Xử lý Quên Mật Khẩu (Tạo token và gửi mail)
export const forgotPassword = async (email: string) => {
  // Kiểm tra email có tồn tại không
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Không tìm thấy người dùng với email này!");
  }

  // Tạo một Token tạm thời để đổi mật khẩu (Chỉ sống trong 15 phút cho an toàn)
  const resetToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET as string,
    { expiresIn: "15m" },
  );

  // TẠO LINK TRỎ VỀ FRONTEND (Cổng 3000)
  // Link này phải khớp với cấu trúc thư mục src/app/reset-password/[id]/[token] của Sếp
  const resetUrl = `http://localhost:3000/reset-password/${user.id}/${resetToken}`;

  // Trả về thông tin để Controller gọi Nodemailer gửi đi
  return { user, resetUrl };
};

// 2. Hàm Đặt lại Mật khẩu Mới
export const resetPassword = async (
  id: string,
  token: string,
  newPassword: string,
) => {
  try {
    // Kiểm tra Token xem có hợp lệ hoặc hết hạn chưa
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    // Kiểm tra xem ID trong token có khớp với ID người dùng không
    if (decoded.id !== id) {
      throw new Error("Token không hợp lệ cho người dùng này!");
    }

    // Mã hóa mật khẩu mới
    const hashedPassword = await hashPassword(newPassword);

    // Cập nhật vào Database
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: "Đổi mật khẩu thành công!" };
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new Error(
        "Link đã hết hạn (quá 15 phút), vui lòng xin cấp link mới!",
      );
    }
    throw new Error("Link khôi phục không hợp lệ!");
  }
};
