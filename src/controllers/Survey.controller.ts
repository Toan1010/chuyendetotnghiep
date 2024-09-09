import { Request, Response } from "express";

export const GetListSurvey = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const DetailSurvey = async (req: Request, res: Response) => {};

export const TakeSurvey = async (req: Request, res: Response) => {};

export const CreateSurvey = async (req: Request, res: Response) => {
  try {
    const { name, description, dueAt, list_question } = req.body;
    
} catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateSurvey = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const DeleteSurvey = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
