import { Request, Response } from "express";
import { getListStudent } from "../services/Student.service";

export const ListStudent = async (req: Request, res: Response) => {
  try {
    let { page = 1, limit = 10, name } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const offset = (page - 1) * limit;
    const result = await getListStudent(limit, offset, name as string);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const AddNewStudent = async (req: Request, res: Response) => {
  return res.json("AddNewStudent");
};

export const BulkAdd = async (req: Request, res: Response) => {
  return res.json("BulkAdd");
};

export const DetailStudent = async (req: Request, res: Response) => {
  return res.json("DetailStudent");
};

export const UpdateStudent = async (req: Request, res: Response) => {
  return res.json("UpdateStudent");
};

export const DeleteStudent = async (req: Request, res: Response) => {
  return res.json("DeleteStudent");
};
