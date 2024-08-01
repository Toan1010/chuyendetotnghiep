import { Op } from "sequelize";
import Student from "../models/Student.model";

export const getListStudent = async (
  limit: number,
  offset: number,
  name: string | undefined
) => {
  const whereClause = name
    ? {
        [Op.or]: [{ student_name: { [Op.like]: `%${name}%` } }],
      }
    : {};
   const { count, rows: users } = await Student.findAndCountAll({
     where: whereClause,
     offset: offset,
     limit: limit,
     attributes: { exclude: ["hash_password"] }, // Loại bỏ trường hash_password
   });
   return { count, users };
};

export const getStudentByID = async (id: number) => {
  const student = await Student.findByPk(id);
  return student;
};

export const getStudentbyEmail = async (email: string) => {
  const student = await Student.findOne({ where: { student_email: email } });
  return student;
};

export const changePassword = async (email: string, password: string) => {
  const [updated] = await Student.update(
    { hash_password: password },
    { where: { student_email: email } }
  );
  return updated > 0;
};
