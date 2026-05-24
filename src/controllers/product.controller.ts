import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client"; // Bổ sung import Prisma để truy vấn trực tiếp
import {
  createProduct,
  getAllProducts,
  createProductVariant,
  updateProduct,
} from "../services/product.service";
import redisClient from "../utils/redis";

// Khởi tạo Prisma Client
const prisma = new PrismaClient();

export const addProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const product = await createProduct(req.body);
    return res.status(201).json({ status: "success", data: product });
  } catch (error: any) {
    return res.status(400).json({
      status: "error",
      message: "Lỗi khi tạo sản phẩm! Vui lòng kiểm tra lại dữ liệu đầu vào.",
      detail: error.message,
    });
  }
};

/**
 * LẤY DANH SÁCH SẢN PHẨM (CÓ TÌM KIẾM, LỌC, PHÂN TRANG)
 */
export const getProducts = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    // Tạm tắt Redis Cache
    const result = await getAllProducts(req.query);

    return res.status(200).json({
      status: "success",
      data: result.data,
      meta: result.pagination,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: "error",
      message: "Lỗi server khi lấy sản phẩm",
      detail: error.message,
    });
  }
};

export const addVariant = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const variant = await createProductVariant(id, req.body);
    return res.status(201).json({ status: "success", data: variant });
  } catch (error: any) {
    return res.status(400).json({
      status: "error",
      message: "Lỗi khi thêm biến thể sản phẩm!",
      detail: error.message,
    });
  }
};

export const editProduct = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;
    const updated = await updateProduct(id, req.body);
    return res.status(200).json({
      status: "success",
      message: "Cập nhật sản phẩm thành công!",
      data: updated,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: "error",
      message: "Không tìm thấy sản phẩm để cập nhật!",
    });
  }
};

/**
 * LẤY CHI TIẾT 1 SẢN PHẨM (MỚI THÊM ĐỂ FIX LỖI 404 TRANG CHI TIẾT)
 */
export const getProductById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm theo ID, lôi kèm cả nhãn hàng, danh mục và các phiên bản cấu hình
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        variants: true, // Bắt buộc phải có để Frontend biết giá tiền, màu sắc, RAM, ROM
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Không tìm thấy sản phẩm!" });
    }

    return res.status(200).json({
      status: "success",
      data: product,
    });
  } catch (error: any) {
    console.error("Lỗi getProductById:", error);
    return res.status(500).json({ status: "error", message: "Lỗi server!" });
  }
};
