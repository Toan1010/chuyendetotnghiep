import { Op } from "sequelize";
import Admin from "../models/Admin.model";

export const listAdmin = async (
  limit: number,
  offset: number,
  name: string
) => {
  const whereClause = name
    ? {
        [Op.or]: [{ fullName: { [Op.like]: `%${name}%` } }],
      }
    : {};
  const { count, rows: users } = await Admin.findAndCountAll({
    where: whereClause,
    offset: offset,
    limit: limit,
    attributes: { exclude: ["hashPassword"] },
  });
  return { count, users };
};

export const addAdmin = async (
  fullName: string,
  email: string,
  hashPassword: string,
  can_course: boolean,
  can_student: boolean
) => {
  return await Admin.create({
    fullName,
    email,
    hashPassword,
    can_course,
    can_student,
  });
};

export const isExist = async (id?: number, email?: string) => {
  const whereClause: any = {};
  if (email) {
    whereClause.email = email;
  } else if (id) {
    whereClause.id = id;
  }
  const admin = await Admin.findOne({ where: whereClause });
  return admin;
};

export const updateAdmin = async (id: number, updateData: object) => {
  return await Admin.update(updateData, {
    where: { id: id },
  });
};

export const coursePermission = async (id: number) => {
  const admin = await Admin.findByPk(id);
  return admin?.course_permission;
};

export const studentPermission = async (id: number) => {
  const admin = await Admin.findByPk(id);
  return admin?.student_permission;
};
