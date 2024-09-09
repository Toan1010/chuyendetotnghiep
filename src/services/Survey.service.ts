import Survey from "../models/Survey.Model";
import SurveyQuestion from "../models/SurveyQuestion.Model";

export const isExist = async (id: number, name?: string) => {
    const whereClause: any = {};
    if (name) {
      whereClause.name = name;
    } else if (id) {
      whereClause.id = id;
    }
    const admin = await Survey.findOne({ where: whereClause });
    return admin;
};
