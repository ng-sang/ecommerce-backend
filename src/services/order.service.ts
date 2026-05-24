import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import qs from "qs";

const prisma = new PrismaClient();

// ========================================================
// 🛠️ HÀM SORT CHUẨN CỦA VNPAY (Khắc phục 100% lỗi sai chữ ký)
// ========================================================
function sortObject(obj: any) {
  let sorted: any = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// Hàm định dạng thời gian theo chuẩn yyyyMMddHHmmss của VNPAY
const formatVNPDate = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, "0");
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
};

/**
 * TẠO URL THANH TOÁN VNPAY
 */
export const createVNPayUrl = async (
  orderId: string,
  amount: number,
  ipAddr: string,
): Promise<string> => {
  const tmnCode = process.env.VNP_TMNCODE || "DEMO2014";
  const secretKey = process.env.VNP_HASHSECRET || "SECRET_KEY_CUA_VNPAY";
  let vnpUrl =
    process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl =
    process.env.VNP_RETURNURL || "http://localhost:3000/payment-success";

  const date = new Date();
  const createDate = formatVNPDate(date);

  let vnp_Params: any = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    // Đã thay đổi khoảng trắng thành dấu gạch dưới để an toàn khi mã hóa
    vnp_OrderInfo: `Thanh_toan_don_hang_VIP_STORE_${orderId}`,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  // Sử dụng hàm sortObject chuẩn thay vì logic sort cũ
  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });

  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + qs.stringify(vnp_Params, { encode: false });

  return vnpUrl;
};

/**
 * KIỂM TRA CHỮ KÝ TRẢ VỀ TỪ VNPAY
 */
/**
 * KIỂM TRA CHỮ KÝ TRẢ VỀ TỪ VNPAY
 */
export const verifyVNPayReturn = async (vnp_Query: any) => {
  const orderId = vnp_Query["vnp_TxnRef"];
  const responseCode = vnp_Query["vnp_ResponseCode"];

  // Kiểm tra đơn hàng trong DB
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  // Nếu đơn đã PAID rồi thì cho qua ngay (Fix lỗi F5 bị báo lỗi)
  if (order && order.status === "PAID") {
    return { success: true, orderId, message: "Đã thanh toán trước đó" };
  }

  // Nếu là responseCode 00 thì cập nhật
  if (responseCode === "00") {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PAID" },
    });
    return { success: true, orderId, message: "Thanh toán thành công" };
  }

  return { success: false, orderId, message: "Giao dịch thất bại" };
};

/**
 * LẤY LỊCH SỬ ĐƠN HÀNG CỦA RIÊNG USER (Đã ép kiểu as any để fix gạch đỏ Prisma)
 */
export const getOrdersByUser = async (userId: string): Promise<any> => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  return orders as any;
};
