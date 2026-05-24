import { Request, Response } from "express";
import { createBrand, getAllBrands } from "../services/brand.service";

export const addBrand = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ status: "error", message: "Vui lòng nhập tên hãng!" });
    }

    const brand = await createBrand(name);
    return res.status(201).json({ status: "success", data: brand });
  } catch (error: any) {
    return res
      .status(400)
      .json({ status: "error", message: "Tên hãng này đã tồn tại!" });
  }
};

export const getBrands = async (req: Request, res: Response): Promise<any> => {
  try {
    const brands = await getAllBrands();
    return res.status(200).json({ status: "success", data: brands });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: "Lỗi server" });
  }
};
