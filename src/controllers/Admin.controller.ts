import { Request, Response } from "express";
import * as AdminService from "../services/Admin.service";

export const GetListAdmin = async (req: Request, res: Response) => {};

export const GetAdminByID = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const admin = await AdminService.getAdminByID(id);
    if (admin) {
      res.status(200).json(admin);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
