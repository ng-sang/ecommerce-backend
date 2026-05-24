import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Hàm tạo danh mục mới
export const createCategory = async (name: string) => {
  return await prisma.category.create({
    data: { name },
  });
};

// Hàm lấy tất cả danh mục
export const getAllCategories = async () => {
  return await prisma.category.findMany();
};
