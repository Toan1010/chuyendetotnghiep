import { Request, Response } from "express";

import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { imageUpload } from "../configurations/multer";

import { convertString } from "../helpers/convertToSlug";
import Topic from "../models/Topic.Model";
import Course from "../models/Course.Model";
import Student from "../models/Student.Model";
import CourseSub from "../models/CourseSub.Model";

import { Op, fn, col } from "sequelize";
import Lesson from "../models/Lesson.Model";
import { changeTime } from "../helpers/formatTime";

export const GetListCourse = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "", topic_id } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const whereCondition: any = {
      [Op.or]: [{ name: { [Op.like]: `%${key_name}%` } }],
    };
    if (topic_id) {
      whereCondition.topic_id = topic_id;
    }
    let { count, rows: courses } = await Course.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: ["id", "name", "slug", "thumbnail", "type", "createdAt"],
      include: [
        {
          model: Topic,
          as: "topic",
          attributes: ["name"],
        },
      ],
      raw: true,
    });

    const coursesWithStudentCount = await Promise.all(
      courses.map(async (course: any) => {
        let { createdAt, ...rest } = course;
        createdAt = changeTime(createdAt);
        const studentCount = await CourseSub.count({
          where: { course_id: course.id },
        });
        return {
          ...rest,
          createdAt,
          studentCount,
        };
      })
    );
    return res.json({
      count,
      courses: coursesWithStudentCount,
    });
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const CreateCourse = async (req: Request, res: Response) => {
  imageUpload.single("thumbnail")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json(err.message);
    } else if (err) {
      return res.status(400).json(err.message);
    }
    const thumbnail = req.file?.filename || "course.png";
    try {
      const { name, description, topic_id, type } = req.body;
      const exist = await Course.findOne({ where: { name } });
      if (exist) {
        return res.status(409).json("Khoá học đã tồn tại!");
      }
      const slug = convertString(name);
      await Course.create({
        name,
        description,
        slug,
        topic_id,
        type,
        thumbnail,
      });
      return res.json("Tạo mới khóa học thành công!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const UpdateCourse = async (req: Request, res: Response) => {
  imageUpload.single("thumbnail")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json(err.message);
    } else if (err) {
      return res.status(400).json(err.message);
    }
    const id = req.params.id;
    const course = await Course.findByPk(parseInt(id));
    if (!course) {
      return res.status(404).json("Khóa học không tồn tại!");
    }
    const oldthumbnailPath = path.join(
      __dirname,
      "../../public/images",
      course.thumbnail
    );
    const thumbnail = req.file?.filename || course.thumbnail;
    try {
      const {
        name = course.name,
        description = course.description,
        type = course.type,
        topic_id = course.topic_id,
      } = req.body;
      const slug = convertString(name);
      await course.update({
        name,
        description,
        type,
        topic_id,
        thumbnail,
        slug,
      });
      if (req.file?.filename) {
        try {
          await fs.unlink(oldthumbnailPath);
        } catch (error: any) {
          console.error("Failed to delete old thumbnail:", error.message);
        }
      }
      return res.json("Cập nhật thông tin khóa học thành công!");
    } catch (error: any) {
      return res.json(error.message);
    }
  });
};

export const DeleteCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const course = await Course.findByPk(parseInt(id));
    if (!course) {
      return res.status(404).json("Khóa học không tồn tại!");
    }
    await course.destroy();
    return res.json({ message: "Xoá khóa học thành công!" });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AddToCourse = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const course = await Course.findByPk(parseInt(id));
    if (!course) {
      return res.status(404).json("Khóa học không tồn tại !");
    }
    const { list_student }: { list_student: number[] } = req.body;

    await Promise.all(
      list_student.map(async (studentId) => {
        const student = await Student.findByPk(studentId);
        if (!student) {
          return null;
        }
        const subscribe = await CourseSub.findOne({
          where: { student_id: studentId, course_id: id },
        });
        if (subscribe) {
          return null;
        }
        return CourseSub.create({ student_id: studentId, course_id: id });
      })
    );
    return res.status(200).json("Đã thêm học sinh vào khóa học thành công");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailCourse = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const course = await Course.findOne({
      where: { slug },
      attributes: [
        "id",
        "name",
        "slug",
        "description",
        "thumbnail",
        "type",
        "createdAt",
      ],
      include: [{ model: Topic, as: "topic", attributes: ["name"] }],
      raw: true,
    });
    const user = (req as any).user;
    if (!course) {
      return res.status(404).json("Khóa học không tồn tại!");
    }
    const countStudent = await CourseSub.count({
      where: { course_id: course.id },
    });
    const totalLesson = await Lesson.count({ where: { course_id: course.id } });
    // const result = await CourseSub.findOne({
    //   attributes: [[fn("AVG", col("rate")), "averageRate"]],
    //   where: { course_id: course.id },
    // });
    let data: any = { ...course, countStudent, totalLesson };
    if (user.role == 0) {
      const subscribe = await CourseSub.findOne({
        where: { course_id: course.id, student_id: user.id },
        attributes: ["process", "rate"],
      });
      data.process = subscribe?.process;
    }
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CourseRegister = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const slug = req.params.course_slug;
    const course = await Course.findOne({ where: { slug } });
    if (!course) {
      return res.status(404).json("Khóa học không tồn tại!");
    }
    if (course.type) {
      return res
        .status(401)
        .json("Khóa học này cần phải được admin cấp quyền!");
    }
    await CourseSub.create({ student_id: user.id, course_id: course.id });
    return res.json("Đăng ký khóa học thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const WriteReview = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const slug = req.params.course_slug;
    const { rate, comment } = req.body;

    const course = await Course.findOne({ where: { slug } });
    if (!course) {
      return res.status(404).json("Khoa hoc khong ton tai!");
    }
    const sub = await CourseSub.findOne({
      where: { course_id: course.id, student_id: user.id },
    });
    if (!sub) {
      return res.status(401).json("Ban can phai hoc truoc khi danh gia!");
    }
    await sub.update({ rate, comment });
    return res.json("Danh gia khoa hoc thanh cong!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CourseReview = async (req: Request, res: Response) => {
  try {
    const slug = req.params.course_slug;
    const course = await Course.findOne({ where: { slug } });
    const user = (req as any).user;
    if (!course) {
      return res.status(404).json("Kho hojc khong ton tai!");
    }
    const { count, rows: reviews } = await CourseSub.findAndCountAll({
      where: { course_id: course.id, rate: { [Op.ne]: null } },
      attributes: ["rate", "comment"],
      order: [["rate", "ASC"]],
    });
    let data: any = { count, reviews };
    if (user.role == 0) {
      const sub = await CourseSub.findOne({
        attributes: ["id", "rate", "comment"],
        where: { course_id: course.id, student_id: user.id },
      });
      data.my_review = sub;
    }
    return res.json(data);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
