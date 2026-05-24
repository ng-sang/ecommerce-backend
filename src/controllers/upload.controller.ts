import { Request, Response } from "express";

export const uploadImage = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "Không có file ảnh nào được tải lên!",
      });
    }

    // ĐÃ SỬA DÒNG NÀY: Lấy thẳng đường link thật từ Cloudinary trả về
    const imageUrl = req.file.path;

    return res.status(200).json({
      status: "success",
      message: "Tải ảnh lên thành công!",
      data: { imageUrl },
    });
  } catch (error: any) {
    return res.status(500).json({ status: "error", message: error.message });
  }
};
