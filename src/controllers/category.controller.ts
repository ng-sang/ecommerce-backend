import { Request, Response } from "express";
import { createCategory, getAllCategories } from "../services/category.service";

export const addCategory = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ status: "error", message: "Vui lòng nhập tên danh mục!" });
    }

    const category = await createCategory(name);
    return res.status(201).json({ status: "success", data: category });
  } catch (error: any) {
    return res
      .status(400)
      .json({ status: "error", message: "Tên danh mục này đã tồn tại!" });
  }
};

export const getCategories = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const categories = await getAllCategories();
    return res.status(200).json({ status: "success", data: categories });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
