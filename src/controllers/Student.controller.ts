import { Request, Response } from "express";

export const ListStudent = async (req: Request, res: Response) => {
  return res.json("ListStudent");
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
