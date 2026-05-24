import { Request, Response } from "express";
import * as AdminService from "../services/admin.service";

export const addProduct = async (req: Request, res: Response) => {
  try {
    const product = await AdminService.createFullProduct(req.body);
    res.status(201).json({ status: "success", data: product });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedProduct = await AdminService.updateProductData(id, req.body);
    res.status(200).json({ status: "success", data: updatedProduct });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const fetchAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await AdminService.getAllProducts();
    res.status(200).json({ status: "success", data: products });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const fetchAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await AdminService.getAllOrders();
    res.status(200).json({ status: "success", data: orders });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const changeOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const updated = await AdminService.updateOrderStatus(orderId, status);
    res.status(200).json({ status: "success", data: updated });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const stats = await AdminService.getDashboardStats();
    res.status(200).json({ status: "success", data: stats });
  } catch (error: any) {
    res
      .status(500)
      .json({ status: "error", message: "Lỗi hệ thống khi lấy thống kê!" });
  }
};

export const removeProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await AdminService.deleteProduct(id);
    res.status(200).json({ status: "success", message: "Đã xóa thành công!" });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};
