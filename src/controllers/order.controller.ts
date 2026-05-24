import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { PrismaClient } from "@prisma/client";
import {
  getOrdersByUser,
  createVNPayUrl,
  verifyVNPayReturn,
} from "../services/order.service";

const prisma = new PrismaClient();

/**
 * ĐẶT HÀNG: Lưu đơn và tự động sửa ID lệch pha
 */
export const placeOrder = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user.id;
    const { items, totalPrice } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Giỏ hàng trống!" });
    }

    const orderItemsData = [];

    // Tự động nắn ID: Kiểm tra variantId hợp lệ, nếu không thì lấy variant đầu tiên của Product
    for (const item of items) {
      const isVariantExist = await prisma.productVariant.findUnique({
        where: { id: item.id },
      });
      let actualId = item.id;

      if (!isVariantExist) {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
          include: { variants: true },
        });
        if (product && product.variants.length > 0) {
          actualId = product.variants[0].id;
        }
      }

      orderItemsData.push({
        variantId: actualId,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const order = await prisma.order.create({
      data: {
        userId: userId,
        totalPrice: totalPrice,
        items: { create: orderItemsData },
      },
    });

    const ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const paymentUrl = await createVNPayUrl(
      order.id,
      order.totalPrice,
      ipAddr as string,
    );

    return res.status(201).json({
      status: "success",
      data: { id: order.id, paymentUrl },
    });
  } catch (error: any) {
    return res.status(400).json({ status: "error", message: error.message });
  }
};

/**
 * LẤY LỊCH SỬ ĐƠN HÀNG CỦA TÔI
 */
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const orders = await getOrdersByUser(req.user.id);
    return res.status(200).json({ status: "success", data: orders });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};

/**
 * ADMIN: QUẢN LÝ ĐƠN HÀNG
 */
export const manageAllOrders = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, fullName: true } },
        items: true,
      },
    });
    return res.status(200).json({ status: "success", data: orders });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Lỗi admin" });
  }
};

/**
 * ADMIN: THAY ĐỔI TRẠNG THÁI
 */
export const changeOrderStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return res.status(200).json({ status: "success", data: updatedOrder });
  } catch (error: any) {
    return res.status(400).json({ status: "error", message: "Lỗi cập nhật" });
  }
};

/**
 * TẠO LẠI LINK THANH TOÁN
 */
export const createPaymentUrl = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order)
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy đơn" });

    const ipAddr =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const paymentUrl = await createVNPayUrl(
      order.id,
      order.totalPrice,
      ipAddr as string,
    );

    return res.status(200).json({ status: "success", data: { paymentUrl } });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};

/**
 * VNPAY: XỬ LÝ KẾT QUẢ VÀ CHUYỂN HƯỚNG
 */
export const vnpayReturn = async (req: any, res: any): Promise<any> => {
  try {
    const result = await verifyVNPayReturn(req.query);

    // Đá về trang Frontend kèm tham số trạng thái
    if (result.success) {
      return res.redirect(
        "http://localhost:3000/payment-result?status=success",
      );
    } else {
      return res.redirect("http://localhost:3000/payment-result?status=failed");
    }
  } catch (error: any) {
    return res.redirect("http://localhost:3000/payment-result?status=error");
  }
};
