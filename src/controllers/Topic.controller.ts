import { Request, Response } from "express";
import { addTopic, isExist, listTopic } from "../services/Topic.service";

export const GetListTopic = async (req: Request, res: Response) => {
  try {
    const result = await listTopic();
    return res.json({ ...result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const CreateTopic = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const topic = await isExist(undefined, name);
    if (topic) {
      return res.status(409).json({ error: "Topic đã tồn tại!" });
    }
    await addTopic(name, description);
    return res.json({ message: "Tạo mới topic thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    const topic = await isExist(parseInt(id));
    if (!topic) {
      return res.status(404).json({ error: "Topic không tồn tại !" });
    }
    await topic.update({ name, description });
    return res.json({ message: "Cập nhật topic thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const DeleteTopic = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const topic = await isExist(parseInt(id));
    if (!topic) {
      return res.status(404).json({ error: "Topic không tồn tại !" });
    }
    await topic.destroy();
    return res.json({ message: "Xoá topic thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
