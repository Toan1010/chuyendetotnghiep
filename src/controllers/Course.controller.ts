import { Request, Response } from "express";
import multer from "multer";
import { imageUpload } from "../configurations/multer";
import { convertString } from "../helpers/convertToSlug";
import Topic from "../models/Topic.Model";
import Course from "../models/Course.Model";
import CourseSub from "../models/CourseSub.Model";
import { Op } from "sequelize";
import Student from "../models/Student.Model";

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
        const studentCount = await CourseSub.count({
          where: { course_id: course.id },
        });
        return {
          ...course,
          studentCount,
        };
      })
    );
    return res.json({ count, courses: coursesWithStudentCount });
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
    const thumbnail = req.file?.originalname || "course.png";
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
    const thumbnail = req.file?.originalname || course.thumbnail;
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
    // return res.json(list_student)

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
    if (!course) {
      return res.json(404).json({ error: "Khóa học không tồn tại!" });
    }
    return res.json({ course });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
