import { Request, Response } from "express";
import Topic from "../models/Topic.Model";
import { convertString } from "../helpers/convertToSlug";

export const GetListTopic = async (req: Request, res: Response) => {
  try {
    const { count, rows: topics } = await Topic.findAndCountAll({
      attributes: ["id", "name", "slug"],
    });
    return res.json({ count, topics });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CreateTopic = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const topic = await Topic.findOne({ where: { name } });
    if (topic) {
      return res.status(409).json("Topic đã tồn tại!");
    }
    const slug = convertString(name);
    await Topic.create({ name, slug, description });
    return res.json("Tạo mới topic thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const topic = await Topic.findByPk(parseInt(id));
    if (!topic) {
      return res.status(404).json("Topic không tồn tại !");
    }
    const { name = topic.name, description = topic.description } = req.body;
    const slug = convertString(name);
    await topic.update({ name, slug, description });
    return res.json("Cập nhật topic thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DeleteTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const topic = await Topic.findByPk(parseInt(id));
    if (!topic) {
      return res.status(404).json("Topic không tồn tại !");
    }
    await topic.destroy();
    return res.json("Xoá topic thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
