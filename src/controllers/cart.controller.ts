import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { addItemToCart, getCart } from "../services/cart.service";

export const addToCart = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    // Lấy userId từ thẻ bảo vệ verifyToken
    const userId = req.user.id;
    const { variantId, quantity } = req.body;

    if (!variantId || !quantity) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "Thiếu thông tin sản phẩm hoặc số lượng!",
        });
    }

    const cartItem = await addItemToCart(userId, variantId, quantity);
    return res
      .status(200)
      .json({
        status: "success",
        message: "Đã thêm vào giỏ hàng!",
        data: cartItem,
      });
  } catch (error: any) {
    return res
      .status(500)
      .json({
        status: "error",
        message: "Lỗi khi thêm vào giỏ hàng",
        detail: error.message,
      });
  }
};

export const viewCart = async (
  req: AuthRequest,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.user.id;
    const cart = await getCart(userId);

    if (!cart) {
      return res.status(200).json({ status: "success", data: { items: [] } }); // Giỏ trống
    }

    return res.status(200).json({ status: "success", data: cart });
  } catch (error: any) {
    return res
      .status(500)
      .json({ status: "error", message: "Lỗi khi lấy giỏ hàng" });
  }
};
