import { Op } from "sequelize";
import Student from "../models/Student.model";
import { UpdateStudentData } from "../type";

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

export const addNewStudent = async (studentData: {
  student_name: string;
  student_email: string;
  phone: string;
  hash_password: string;
  avatar?: string;
}) => {
  const newStudent = await Student.create(studentData);
  return newStudent;
};

export const updateStudent = async (
  id: number,
  updateData: UpdateStudentData
) => {
  const update = await Student.update(updateData, {
    where: { id: id },
    returning: true,
  });
  return;
};

export const existingStudentByEmailorPhone = async (
  email: string,
  phone: string,
  excludeId?: number
) => {
  const query: any = {
    where: {
      [Op.or]: [{ student_email: email }, { phone: phone }],
    },
  };
  if (excludeId) {
    query.where[Op.and] = { id: { [Op.ne]: excludeId } };
  }
  const existingStudent = await Student.findOne(query);
  return existingStudent;
};

export const changePassword = async (email: string, password: string) => {
  const [updated] = await Student.update(
    { hash_password: password },
    { where: { student_email: email } }
  );
  return updated > 0;
};
