import { Op, where } from "sequelize";
import Student from "../models/Student.Model";

export const listStudent = async (
  limit: number,
  offset: number,
  name: string
) => {
  const whereClause = name
    ? {
        [Op.or]: [{ fullName: { [Op.like]: `%${name}%` } }],
      }
    : {};
  const { count, rows: users } = await Student.findAndCountAll({
    where: whereClause,
    offset: offset,
    limit: limit,
    attributes: { exclude: ["hashPassword"] },
    order: [["id", "DESC"]],
  });
  return { count, users };

};

export const isExist = async (id?: number, email?: string) => {
  const whereClause: any = {};

  if (email) {
    whereClause.email = email;
  } else if (id) {
    whereClause.id = id;
  }

  const student = await Student.findOne({ where: whereClause });
  return student;
};

export const addStudent = async (
  fullName: string,
  email: string,
  hashPassword: string,
  avatar: string
) => {
  return await Student.create({
    fullName,
    email,
    hashPassword,
    avatar,
  });
};

export const updateStudent = async (id: number, updateData: object) => {
  return await Student.update(updateData, {
    where: { id: id },
  });
};