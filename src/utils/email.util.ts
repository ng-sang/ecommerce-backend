import nodemailer from "nodemailer";

export const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  // 1. Cấu hình trạm phát sóng (Sử dụng cấu hình SMTP tường minh thay vì service)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // Chỉ đợi kết nối tối đa 10 giây
    greetingTimeout: 10000, // Chỉ đợi Google chào hỏi 10 giây
    logger: true, // Bật tính năng ghi nhật ký
    debug: true, // Bật chế độ soi lỗi chi tiết
  });

  // 2. Nội dung bức thư
  const mailOptions = {
    from: '"Cửa Hàng Điện Thoại VIP" <no-reply@cuahang.com>',
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Tiến hành gửi
  await transporter.sendMail(mailOptions);
};
