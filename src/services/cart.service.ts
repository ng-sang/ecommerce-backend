import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * THÊM SẢN PHẨM VÀO GIỎ HÀNG (CÓ KIỂM TRA KHO)
 * Đã đổi tên thành addItemToCart để khớp với lỗi trên Postman của bạn
 */
export const addItemToCart = async (
  userId: string,
  variantId: string,
  quantity: number,
) => {
  // 1. Tìm giỏ hàng của User, nếu chưa có thì tạo mới
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  // 2. Kiểm tra tồn kho của sản phẩm (ProductVariant)
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    throw new Error("Sản phẩm không tồn tại!");
  }

  // 3. Kiểm tra xem sản phẩm này đã có trong giỏ hàng chưa
  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      variantId: variantId,
    },
  });

  // Tính tổng số lượng mà khách muốn có trong giỏ
  const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
  const newTotalQuantity = currentQuantityInCart + quantity;

  // LỚP BẢO VỆ: Kiểm tra xem tổng số lượng có vượt quá kho không
  if (newTotalQuantity > variant.stock) {
    throw new Error(
      `Rất tiếc, sản phẩm này chỉ còn tồn kho ${variant.stock} cái. Bạn hiện đã có ${currentQuantityInCart} cái trong giỏ.`,
    );
  }

  // 4. Nếu đã có trong giỏ -> Cập nhật số lượng
  if (existingItem) {
    return await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newTotalQuantity },
    });
  }

  // 5. Nếu chưa có -> Tạo món mới trong giỏ
  return await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId,
      quantity,
    },
  });
};

/**
 * CẬP NHẬT SỐ LƯỢNG TRONG GIỎ (CÓ KIỂM TRA KHO)
 */
export const updateCartItem = async (itemId: string, quantity: number) => {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { variant: true },
  });

  if (!cartItem) {
    throw new Error("Không tìm thấy món hàng này trong giỏ!");
  }

  if (quantity > cartItem.variant.stock) {
    throw new Error(
      `Số lượng vượt quá tồn kho hiện có (${cartItem.variant.stock} cái).`,
    );
  }

  if (quantity <= 0) {
    return await prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  return await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
};

/**
 * XÓA MÓN HÀNG KHỎI GIỎ
 */
export const removeFromCart = async (itemId: string) => {
  return await prisma.cartItem.delete({
    where: { id: itemId },
  });
};

/**
 * XEM GIỎ HÀNG
 */
export const getCart = async (userId: string) => {
  return await prisma.cart.findUnique({
    where: { userId },
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
};
