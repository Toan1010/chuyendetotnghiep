import { Request, Response } from "express";
import {
  addQuestion,
  createSurvey,
  isExist,
  surveyQuestion,
} from "../services/Survey.service";

export const GetListSurvey = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const DetailSurvey = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const survey = await isExist(undefined, undefined, slug);
    if (!survey) {
      return res.status(404).json({ error: "Bài khảo sát không tồn tại!" });
    }
    const { count, question } = await surveyQuestion(survey.id);
    return res.json({ survey, count, question });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const TakeSurvey = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json({ error: error.any });
  }
};

export const CreateSurvey = async (req: Request, res: Response) => {
  try {
    const { name, description, topic_id, dueAt, list_question } = req.body;
    const exist = await isExist(undefined, name);
    if (exist) {
      return res.status(409).json({ error: "Tên khảo sát đã tồn tại!" });
    }
    const survey = await createSurvey(name, parseInt(topic_id), dueAt);
    await addQuestion(list_question, survey.id);
    return res.json({ message: "Thêm khảo sát thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message, ab: "123" });
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
