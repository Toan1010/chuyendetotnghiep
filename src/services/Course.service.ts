import { Op } from "sequelize";
import { convertString } from "../helpers/convertToSlug";
import Course from "../models/Course.Model";
import Topic from "../models/Topic.Model";

export const isExist = async (id?: number, name?: string) => {
  const whereClause: any = {};
  if (name) {
    whereClause.name = name;
  } else if (id) {
    whereClause.id = id;
  }
  const course = await Course.findOne({ where: whereClause });
  return course;
};

export const addNewCourse = async (
  name: string,
  description: string,
  topic_id: number,
  type: boolean,
  thumbnail: string
) => {
  const slug = convertString(name);
  return Course.create({ name, description, topic_id, type, thumbnail, slug });
};

export const listCourse = async (
  limit: number,
  offset: number,
  name: string
) => {
  const whereClause = name
    ? {
        [Op.or]: [{ fullName: { [Op.like]: `%${name}%` } }],
      }
    : {};
  const { count, rows: courses } = await Course.findAndCountAll({
    where: whereClause,
    offset: offset,
    limit: limit,
    attributes: ["id", "name", "thumbnail", "createdAt", "type"],
    order: [["id", "DESC"]],
    include: [
      {
        model: Topic,
        as: "topic",
        attributes: ["name"],
      },
    ],
  });
  return { count, courses };
};
