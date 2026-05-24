import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const createProduct = async (data: any) => {
  return await prisma.product.create({
    data,
  });
};

/**
 * TÌM KIẾM, LỌC VÀ PHÂN TRANG SẢN PHẨM (Đã vá lỗi Sort)
 */
export const getAllProducts = async (queryParams: any) => {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    sortBy = "createdAt",
    order = "desc",
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const where: Prisma.ProductWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: String(search), mode: "insensitive" } },
      { description: { contains: String(search), mode: "insensitive" } },
    ];
  }

  if (categoryId) where.categoryId = String(categoryId);
  if (brandId) where.brandId = String(brandId);

  if (minPrice || maxPrice) {
    where.variants = {
      some: {
        price: {
          gte: minPrice ? Number(minPrice) : undefined,
          lte: maxPrice ? Number(maxPrice) : undefined,
        },
      },
    };
  }

  // 🛡️ LÁ CHẮN BẢO VỆ SẮP XẾP: Chỉ cho phép sort theo các trường có thật trong bảng Product
  const allowedSortFields = ["createdAt", "name", "id", "updatedAt"];
  const actualSortBy = allowedSortFields.includes(String(sortBy))
    ? String(sortBy)
    : "createdAt";

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: {
        [actualSortBy]: String(order).toLowerCase() === "asc" ? "asc" : "desc",
      },
      include: {
        variants: true,
        category: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(totalItems / take);

  return {
    data: products,
    pagination: {
      currentPage: Number(page),
      limit: take,
      totalItems,
      totalPages,
    },
  };
};

export const createProductVariant = async (productId: string, data: any) => {
  return await prisma.productVariant.create({
    data: {
      ...data,
      productId: productId,
    },
  });
};

export const updateProduct = async (id: string, data: any) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};
