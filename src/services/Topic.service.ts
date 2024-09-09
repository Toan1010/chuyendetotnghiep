import Topic from "../models/Topic.Model";

export const listTopic = async () => {
  const { count, rows: topics } = await Topic.findAndCountAll({});
  return { count, topics };
};

export const isExist = async (id?: number, name?: string) => {
  const whereClause: any = {};
  if (name) {
    whereClause.name = name;
  } else if (id) {
    whereClause.id = id;
  }
  const admin = await Topic.findOne({ where: whereClause });
  return admin;
};

export const addTopic = async (name: string, description: string) => {
  return await Topic.create({ name, description });
};
