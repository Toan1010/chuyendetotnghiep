import Survey from "../models/Survey.Model";
import SurveyQuestion from "../models/SurveyQuestion.Model";
import { convertString } from "../helpers/convertToSlug";

export const isExist = async (
  id?: number,
  name?: string,
  slug?: string
): Promise<Survey | null> => {
  if (!id && !name && !slug) return null;

  const whereClause: { id?: number; name?: string; slug?: string } = {};

  if (id) whereClause.id = id;
  if (name) whereClause.name = name;
  if (slug) {
    console.log(slug);

    whereClause.slug = slug;
  }
  return await Survey.findOne({ where: whereClause });
};

export const createSurvey = async (
  name: string,
  topic_id: number,
  dueAt?: Date
) => {
  let slug = convertString(name);

  const survey = await Survey.create({
    name,
    dueAt: dueAt || new Date(new Date().setDate(new Date().getDate() + 7)),
    topic_id,
    slug,
  });
  return survey;
};

export const addQuestion = async (
  list_question: string[],
  survey_id: number
) => {
  console.log(list_question);

  const questions = list_question.map((question: any) => ({
    survey_id: survey_id,
    name: question,
  }));

  await SurveyQuestion.bulkCreate(questions);
  return questions;
};

export const surveyQuestion = async (survey_id: number) => {
  const { count, rows: question } = await SurveyQuestion.findAndCountAll({
    where: { survey_id },
  });
  return { count, question };
};
