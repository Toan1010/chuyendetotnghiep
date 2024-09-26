import { Request, Response } from "express";
import { addQuestion } from "../services/Survey.service";
import Survey from "../models/Survey.Model";
import SurveyQuestion from "../models/SurveyQuestion.Model";
import { Op} from "sequelize";
import SurveyAttend from "../models/SurveyAttend";
import { convertString } from "../helpers/convertToSlug";

export const GetListSurvey = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "" } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const whereCondition: any = {
      [Op.or]: [{ name: { [Op.like]: `%${key_name}%` } }],
    };
    const { count, rows: surveys } = await Survey.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: ["id", "name", "slug", "dueAt"],
      raw: true,
    });
    const survey_detail = await Promise.all(
      surveys.map(async (survey: any) => {
        const studentCount = await SurveyAttend.count({
          where: { survey_id: survey.id },
        });
        return {
          ...survey,
          participated: studentCount,
        };
      })
    );
    return res.json({ count, surveys: survey_detail });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailSurvey = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const survey = await Survey.findOne({ where: { slug } });
    if (!survey) {
      return res.status(404).json({ error: "Bài khảo sát không tồn tại!" });
    }
    const { count, rows: questions } = await SurveyQuestion.findAndCountAll({
      where: { survey_id: survey.id },
    });
    return res.json({ survey, count, questions });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const TakeSurvey = async (req: Request, res: Response) => {
  try {
    const survey_id = req.params.survey_id;
    const user = (req as any).user;
    const { answers } = req.body;
    const survey = await Survey.findByPk(survey_id, { raw: true });
    if (!survey) {
      return res.status(404).json("Khao sat khong ton tai!");
    }
    const hadAttended = await SurveyAttend.findOne({
      where: { student_id: user.id, survey_id },
    });
    if (hadAttended) {
      return res
        .status(401)
        .json("Bạn đã thực hiện bài khảo sát này trước đó!");
    }
    const detail = await Promise.all(
      answers.map(async (question: any) => {
        const { id, answer } = question;
        const existingQuestion = await SurveyQuestion.findOne({
          where: { id, survey_id },
        });
        if (existingQuestion) {
          let yesCount = existingQuestion.yes;
          let noCount = existingQuestion.no;
          answer === "yes" ? (yesCount += 1) : (noCount += 1);
          await SurveyQuestion.update(
            { yes: yesCount, no: noCount },
            { where: { id, survey_id } }
          );
        }
        return { id, answer };
      })
    );
    await SurveyAttend.create({ student_id: user.id, survey_id, detail });
    return res.json("Lam khao sat thanh cong!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CreateSurvey = async (req: Request, res: Response) => {
  try {
    const {
      name,
      dueAt = new Date(new Date().setDate(new Date().getDate() + 7)),
      list_question,
    } = req.body;
    const exist = await Survey.findOne({ where: { name } });
    if (exist) {
      return res.status(409).json({ error: "Tên khảo sát đã tồn tại!" });
    }
    const slug = convertString(name);
    const survey = await Survey.create({
      name,
      slug,
      dueAt,
    });
    await addQuestion(list_question, survey.id);
    return res.json("Thêm khảo sát thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateSurvey = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DeleteSurvey = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const survey = await Survey.findByPk(parseInt(id));
    if (!survey) {
      return res.status(404).json("Khao sat khong ton tai!");
    }
    await survey.destroy();
    return res.json("Khao sat duoc xoa thanh cong!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
