import { Request, Response } from "express";
import { addNewCourse, isExist, listCourse } from "../services/Course.service";
import { imageUpload } from "../configurations/multer";
import multer from "multer";
import { convertString } from "../helpers/convertToSlug";
import { error } from "console";

export const GetListCourse = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "" } = req.query;
    key_name = typeof key_name === "string" ? key_name : "";
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const offset = (page - 1) * limit;
    const result = await listCourse(limit, offset, key_name);
    return res.json({ result });
  } catch (error: any) {
    return res.json({ error: error.message });
  }
};

export const CreateCourse = async (req: Request, res: Response) => {
  imageUpload.single("thumbnail")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    const thumbnail = req.file?.originalname || "course.png";
    try {
      const { name, description, topic_id, type } = req.body;
      const exist = await isExist(undefined, name);
      if (exist) {
        return res.status(409).json({ error: "Khoá học đã tồn tại!" });
      }
      await addNewCourse(name, description, topic_id, type, thumbnail);
      return res.json({ message: "Tạo mới khóa học thành công!" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
};

export const UpdateCourse = async (req: Request, res: Response) => {
  imageUpload.single("avatar")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    const id = req.params.id;
    const course = await isExist(parseInt(id));
    if (!course) {
      return res.status(404).json({ error: "Khóa học không tồn tại!" });
    }
    const thumbnail = req.file?.path || course.thumbnail;
    try {
      const { name = course.name, description, type, topic_id } = req.body;
      const slug = name ? convertString(name) : course.slug;
      await course.update({
        name,
        description,
        type,
        topic_id,
        thumbnail,
        slug,
      });
      return res.json({ message: "Cập nhật thông tin khóa học thành công!" });
    } catch (error: any) {
      return res.json({ error: error.message });
    }
  });
};

export const DeleteCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const course = await isExist(parseInt(id));
    if (!course) {
      return res.status(404).json({ error: "Khóa học không tồn tại!" });
    }
    await course.destroy();
    return res.json({ message: "Xoá khóa học thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const AddToCourse = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const DetailCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const course = await isExist(parseInt(id));
    if (!course) {
      return res.json(404).json({ error: "Khoa hoc khong ton tai!" });
    }
  } catch (error: any) {
    return res.status(500).json({});
  }
};
