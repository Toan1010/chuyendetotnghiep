import { Request, Response } from "express";

import { videoUpload, documentUpload } from "../configurations/multer";
import multer from "multer";
import fs from "fs";

import {
  AddLessonContinue,
  InsertLesson,
  UpdateLessonOrder,
} from "../services/Lesson.service";

import Course from "../models/Course.Model";
import Lesson from "../models/Lesson.Model";
import Document from "../models/Documents.Model";

export const ListLesson = async (req: Request, res: Response) => {
  try {
    const id = req.params.course_id;
    const { count: totalLesson, rows: lessons } = await Lesson.findAndCountAll({
      where: { course_id: id },
      attributes: ["id", "name"],
      order: [["inCourse", "ASC"]],
    });
    return res.json({ totalLesson, lessons });
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const CreateLesson = async (req: Request, res: Response) => {
  videoUpload.single("video")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json(err.message);
    } else if (err) {
      return res.status(400).json(err.message);
    }
    if (!req.file) {
      return res.status(400).json("Vui lòng tải lên video!");
    }
    const context = req.file.originalname;
    try {
      const id = req.params.course_id;
      const course = await Course.findByPk(parseInt(id));
      if (!course) {
        return res.status(404).json("Khóa học không tồn tại!");
      }
      const { name, description, inCourse = 0 } = req.body;
      inCourse == 0
        ? await AddLessonContinue(name, description, context, parseInt(id))
        : InsertLesson(
            name,
            description,
            context,
            parseInt(id),
            parseInt(inCourse)
          );
      return res.json("Tạo mới khóa học thành công!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const UpdateLesson = async (req: Request, res: Response) => {
  videoUpload.single("video")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json(err.message);
    } else if (err) {
      return res.status(400).json(err.message);
    }
    const id = req.params.lesson_id;
    const lesson = await Lesson.findByPk(parseInt(id));
    if (!lesson) {
      return res.status(404).json("Lesson không tồn tại !");
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
      return res.json("Sửa bài học thành công!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const DeleteLesson = async (req: Request, res: Response) => {
  try {
    const id = req.params.lesson_id;
    const lesson = await Lesson.findByPk(parseInt(id));
    if (!lesson) {
      return res.status(404).json("Bài học không tồn tại");
    }
    await lesson.destroy();
    return res.json("Xóa bài học thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const ListDoc = async (req: Request, res: Response) => {
  try {
    const id = req.params.course_id;
    const { count: totalDocs, rows: docs } = await Document.findAndCountAll({
      where: { course_id: id },
      attributes: ["id", "name", "content"],
    });
    return res.json({ totalDocs, docs });
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const CreateDoc = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const UpdateDoc = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const DeleteDoc = async (req: Request, res: Response) => {
  try {
  } catch (error: any) {
    return res.json(error.message);
  }
};
