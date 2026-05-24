import { PrismaClient } from "@prisma/client";
import { getIO } from "../utils/socket";

const prisma = new PrismaClient();

export const createFullProduct = async (data: any) => {
  let defaultCategory = await prisma.category.findFirst();
  if (!defaultCategory)
    defaultCategory = await prisma.category.create({
      data: { name: "Điện thoại" },
    });

  let defaultBrand = await prisma.brand.findFirst();
  if (!defaultBrand)
    defaultBrand = await prisma.brand.create({ data: { name: "Apple" } });

  const variantsData =
    data.variants && data.variants.length > 0 ? data.variants : [{}];

  return await prisma.product.create({
    data: {
      name: data.name,
      description: data.description || "Mô tả sản phẩm",
      image: data.image || "/default.jpg",
      categoryId: defaultCategory.id,
      brandId: defaultBrand.id,
      variants: {
        create: variantsData.map((v: any) => ({
          ram: v.ram || "8GB",
          rom: v.rom || "128GB",
          color: v.color || "Mặc định",
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 10,
        })),
      },
    },
    include: { variants: true },
  });
};

export const updateProductData = async (productId: string, data: any) => {
  // Cập nhật thông tin sản phẩm chính
  const product = await prisma.product.update({
    where: { id: productId },
    data: {
      name: data.name,
      image: data.image,
    },
  });

  // Cập nhật biến thể đầu tiên (nếu có gửi dữ liệu variants)
  if (data.variants && data.variants.length > 0) {
    const variantData = data.variants[0];
    const existingVariant = await prisma.productVariant.findFirst({
      where: { productId: productId },
    });

    if (existingVariant) {
      await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          ram: variantData.ram,
          rom: variantData.rom,
          color: variantData.color,
          price: Number(variantData.price),
          stock: Number(variantData.stock),
        },
      });
    }
  }
  return product;
};

export const getAllProducts = async () => {
  return await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" }, // Đổi thành xếp mới nhất lên đầu cho Sếp dễ nhìn
  });
};

export const deleteProduct = async (productId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.orderItem.deleteMany({
      where: { variant: { productId: productId } },
    });
    return await tx.product.delete({ where: { id: productId } });
  });
};

export const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  if (status === "PAID") {
    getIO()
      .to("admin_room")
      .emit("newOrderAlert", {
        title: "💰 Ting ting!",
        message: `Đơn hàng #${orderId} đã thanh toán.`,
        orderData: updatedOrder,
      });
  }
  return updatedOrder;
};

export const getDashboardStats = async () => {
  const revenueResult = await prisma.order.aggregate({
    _sum: { totalPrice: true },
    where: { status: "PAID" },
  });
  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });
  const lowStockProducts = await prisma.productVariant.findMany({
    where: { stock: { lt: 10 } },
    include: { product: { select: { name: true, image: true } } },
  });
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { fullName: true, email: true } } },
  });
  return {
    totalRevenue: revenueResult._sum.totalPrice || 0,
    totalOrders,
    totalCustomers,
    lowStockAlerts: lowStockProducts,
    recentOrders,
  };
};
