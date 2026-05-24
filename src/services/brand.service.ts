import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createBrand = async (name: string) => {
  return await prisma.brand.create({
    data: { name },
  });
};

export const getAllBrands = async () => {
  return await prisma.brand.findMany();
};
