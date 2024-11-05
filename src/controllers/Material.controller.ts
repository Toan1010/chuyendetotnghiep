import { Request, Response } from "express";

import { videoUpload, documentUpload } from "../configurations/multer";
import multer from "multer";
import fs from "fs/promises";

import {
  AddLessonContinue,
  InsertLesson,
  UpdateLessonOrder,
} from "../services/Lesson.service";

import Course from "../models/Course.Model";
import Lesson from "../models/Lesson.Model";
import Document from "../models/Documents.Model";
import path from "path";
import CourseSub from "../models/CourseSub.Model";

export const ListLesson = async (req: Request, res: Response) => {
  try {
    const slug = req.params.course_slug;
    const course = await Course.findOne({
      where: {
        slug: slug,
      },
    });
    if (!course) {
      return res.status(404).json("Khóa học không tồn tại!");
    }
    const { count: totalLesson, rows: lessons } = await Lesson.findAndCountAll({
      where: { course_id: course.id },
      attributes: ["id", "name", "description", "inCourse", "context"],
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
    const context = req.file.filename;
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
    const oldVideoPath = path.join(
      __dirname,
      "../../public/videos",
      lesson.context
    );
    const context = req.file?.filename || lesson.context;
    try {
      let {
        name = lesson.name,
        description = lesson.description,
        inCourse,
      } = req.body;

      if (inCourse == 0) {
        inCourse = lesson.inCourse;
      }

      await lesson.update({ name, description, context });

      await UpdateLessonOrder(lesson, inCourse);

      if (req.file?.filename) {
        try {
          await fs.unlink(oldVideoPath);
        } catch (error: any) {
          console.error("Failed to delete old avatar:", error.message);
        }
      }
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
    const courseId = lesson.course_id;

    // Xóa bài học
    await lesson.destroy();

    const remainingLessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["inCourse", "ASC"]],
    });

    for (let i = 0; i < remainingLessons.length; i++) {
      await remainingLessons[i].update({ inCourse: i + 1 });
    }
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
      attributes: ["id", "name", "context", "createdAt"],
      order: [["createdAt", "ASC"]],
    });
    return res.json({ totalDocs, docs });
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const CreateDoc = async (req: Request, res: Response) => {
  documentUpload.single("file")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json(err.message);
    } else if (err) {
      return res.status(400).json(err.message);
    }
    if (!req.file) {
      return res.status(400).json("Vui lòng tải lên tài liệu!");
    }
    const context = req.file.filename;
    try {
      const id = req.params.course_id;
      const course = await Course.findByPk(parseInt(id));
      if (!course) {
        return res.status(404).json("Khóa học không tồn tại!");
      }
      const { name } = req.body;
      await Document.create({ course_id: id, name, context });
      return res.json("Tạo mới tài liệu thành công!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const UpdateDoc = async (req: Request, res: Response) => {
  documentUpload.single("file")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json(err.message);
    } else if (err) {
      return res.status(400).json(err.message);
    }

    const id = req.params.doc_id;
    const doc = await Document.findByPk(parseInt(id));
    if (!doc) {
      return res.status(404).json("Tài liệu không tồn tại!");
    }
    const oldDocPath = path.join(__dirname, "../../public/files", doc.context);
    const context = req.file?.filename || doc.context;
    try {
      const { name = doc.name } = req.body;
      await doc.update({ name, context });
      if (req.file?.filename) {
        try {
          await fs.unlink(oldDocPath);
        } catch (error: any) {
          console.error("Failed to delete old avatar:", error.message);
        }
      }
      return res.json("Sửa tài liệu thành công!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const DeleteDoc = async (req: Request, res: Response) => {
  try {
    const id = req.params.doc_id;
    const doc = await Document.findByPk(parseInt(id));
    if (!doc) {
      return res.status(404).json("Tài liệu không tồn tại!");
    }
    await doc.destroy();
    return res.json("Xóa tài liệu thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailLesson = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { course_slug, lesson_id } = req.params;
    const course = await Course.findOne({ where: { slug: course_slug } });
    if (!course) {
      return res.status(404).json("Khoa hoc khong ton tai!");
    }
    const lesson = await Lesson.findOne({
      where: { id: lesson_id, course_id: course.id },
    });
    if (!lesson) {
      return res.status(404).json("Bai hoc khong ton tai");
    }
    if (user.role == 0) {
      const sub = await CourseSub.findOne({
        where: { course_id: course.id, student_id: user.id },
      });
      if (!sub) {
        return res.status(401).json("Ban chua duoc dang ky khoa hoc nay!");
      }
      if (sub.process + 1 < lesson.inCourse) {
        return res.status(401).json("Ban chua hoc bai hoc truoc do!");
      }
      if (sub.process + 1 === lesson.inCourse) {
        await sub.update({ process: lesson.inCourse });
      }
    }
    return res.json(lesson);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
