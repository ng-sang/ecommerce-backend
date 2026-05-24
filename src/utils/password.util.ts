import bcrypt from "bcryptjs";

// Hàm băm mật khẩu trước khi lưu vào DB
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Hàm kiểm tra mật khẩu lúc khách Đăng nhập
export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
