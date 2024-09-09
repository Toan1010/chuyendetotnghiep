import { Request, Response } from "express";
import { videoUpload } from "../configurations/multer";
import multer from "multer";
import { isExist } from "../services/Course.service";
import {
  AddLessonContinue,
  detailLesson,
  InsertLesson,
  LessonInCourse,
  UpdateLessonOrder,
} from "../services/Lesson.service";

export const ListLessonInCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const course = isExist(parseInt(id));
    if (!course) {
      return res.status(404).json({ error: "Khóa học không tồn tại!" });
    }
    const result = await LessonInCourse(parseInt(id));
    return res.json({ ...result });
  } catch (error: any) {
    return res.json({ erroe: error.message });
  }
};

export const CreateLesson = async (req: Request, res: Response) => {
  videoUpload.single("video")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng tải lên video!" });
    }
    const context = req.file.originalname;
    try {
      const id = req.params.id;
      const course = await isExist(parseInt(id));
      if (!course) {
        return res.status(404).json({ error: "Khóa học không tồn tại!" });
      }
      const { name, description, inCourse } = req.body;
      inCourse == 0
        ? await AddLessonContinue(name, description, context, parseInt(id))
        : InsertLesson(
            name,
            description,
            context,
            parseInt(id),
            parseInt(inCourse)
          );
      return res.json({ message: "Tạo mới khóa học thành công!" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
};

export const UpdateLesson = async (req: Request, res: Response) => {
  videoUpload.single("video")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    const id = req.params.id;
    const lesson = await detailLesson(parseInt(id));
    if (!lesson) {
      return res.status(404).json({ error: "Lesson không tồn tại !" });
    }
    const context = req.file?.originalname || lesson.context;
    try {
      const {
        name = lesson.name,
        description = lesson.description,
        inCourse = lesson.inCourse,
      } = req.body;

      await lesson.update({ name, description, context });
      await UpdateLessonOrder(lesson, inCourse);
      return res.json({ message: "Sửa bài học thành công!" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
};

export const DeleteLesson = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const lesson = await detailLesson(parseInt(id));
    if (!lesson) {
      return res.status(404).json({ error: "Bài học không tồn tại" });
    }
    await lesson.destroy();
    return res.json({ message: "Xóa bài học thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
