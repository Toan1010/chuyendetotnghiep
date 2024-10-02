import { Request, Response } from "express";
import Course from "../models/Course.Model";
import Exam from "../models/Exam.Model";
import ExamQuestion from "../models/ExamQuestion.Model";

import { uploadExcell } from "../configurations/multer";
import XLSX from "xlsx";
import { Op, Sequelize, where } from "sequelize";
import ExamResult from "../models/ExamResult.Model";
import { changeTime } from "../helpers/formatTime";
import Student from "../models/Student.Model";
import CourseSub from "../models/CourseSub.Model";
import _ from "lodash";

export const ListExam = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, course_slug = null } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const courseCondition = course_slug ? { slug: course_slug } : {};
    const { count, rows: exams } = await Exam.findAndCountAll({
      limit,
      offset,
      attributes: [
        "id",
        "name",
        "passingQuestion",
        "numberQuestion",
        "reDoTime",
        "submitTime",
      ],
      include: [
        {
          model: Course,
          as: "exam_course",
          attributes: [],
          where: courseCondition,
        },
      ],
      raw: true,
    });
    return res.json({ count, exams });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AllQuestionOnExam = async (req: Request, res: Response) => {
  try {
    const exam_id = req.params.exam_id;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Exam khong ton taji");
    }
    let { limit = 15, page = 1, key_name = "" } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const whereCondition: any = {
      exam_id,
      [Op.or]: [{ name: { [Op.like]: `%${key_name}%` } }],
    };
    const { count, rows: questions } = await ExamQuestion.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: ["id", "name", "type"],
      raw: true,
    });
    return res.json({ count, questions });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const ListStudentAttend = async (req: Request, res: Response) => {
  try {
    const exam_id = req.params.exam_id;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Exam khong ton taji");
    }
    let { limit = 10, page = 1 } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;

    const { count, rows: students } = await ExamResult.findAndCountAll({
      limit,
      offset,
      attributes: [
        "student_id",
        [Sequelize.fn("COUNT", Sequelize.col("student_id")), "attempt_count"],
        [Sequelize.fn("MAX", Sequelize.col("correctAns")), "highest_score"],
      ],
      where: { exam_id },
      include: [
        { model: Student, as: "student_result", attributes: ["fullName"] },
      ],
      group: ["student_id"],
      raw: true,
    });

    return res.json({ count: count.length, students });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AllExamResult = async (req: Request, res: Response) => {
  try {
    const exam_id = req.params.exam_id;
    const { student_id } = req.query;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Exam khong ton taji");
    }
    const user = (req as any).user;
    let whereCondition: any = {
      exam_id,
    };
    if (user.role !== 0) {
      if (!student_id) {
        return res.json("Chọn id sinh viên muốn xem kết quả");
      }
      whereCondition.student_id = student_id;
    }
    if (user.role === 0) {
      whereCondition.student_id = user.id;
    }
    const { count, rows: results } = await ExamResult.findAndCountAll({
      where: whereCondition,
      attributes: ["id", "correctAns", "createdAt", "submitAt"],
      order: [["createdAt", "DESC"]],
    });

    const formatDate = results.map((result) => {
      let { createdAt, submitAt, ...rest } = result.get({
        plain: true,
      });

      createdAt = changeTime(createdAt);
      submitAt = changeTime(submitAt);
      return { ...rest, createdAt, submitAt };
    });
    return res.json({ count, results: formatDate });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailResultExam = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result_id = req.params.result_id;
    const result = await ExamResult.findByPk(result_id, { raw: true });
    if (!result) {
      return res.status(404).json("Bai lam khong ton tai");
    }
    if (user.role === 0 && result?.student_id !== user.id) {
      return res.status(403).json("Bai lam khong phai cua ban!");
    }
    let { detailResult, ...rest } = result;
    detailResult =
      typeof detailResult === "string"
        ? JSON.parse(detailResult)
        : detailResult;
    return res.json({ detailResult, ...rest });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailExam = async (req: Request, res: Response) => {
  try {
    const exam_id = req.params.exam_id;
    const exam = await Exam.findByPk(exam_id, {
      attributes: [
        "name",
        "numberQuestion",
        "submitTime",
        "reDoTime",
        "passingQuestion",
      ],
      raw: true,
    });
    return res.json({ ...exam });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CreateExam = async (req: Request, res: Response) => {
  try {
    let { name, numberQuestion, passingQuestion, submitTime, reDoTime } =
      req.body;
    const { course_id } = req.params;
    const course = await Course.findByPk(course_id, { raw: true });
    if (!course) {
      return res.status(404).json("Course không tồn tại!");
    }
    if (numberQuestion <= 0) {
      return res.status(400).json("Số lượng câu hỏi không hợp lệ!");
    }
    if (passingQuestion <= 0 || passingQuestion > numberQuestion) {
      return res.status(400).json("Câu trả lời đúng tối thiểu không hợp lệ!");
    }
    submitTime < 10 ? 10 : submitTime;
    reDoTime < 0 ? 0 : reDoTime;

    await Exam.create({
      name,
      numberQuestion,
      passingQuestion,
      submitTime,
      reDoTime,
      course_id,
    });
    return res.json("Tạo bài kiểm thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateExam = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json();
    }
    let {
      name = exam.name,
      numberQuestion = exam.numberQuestion,
      passingQuestion = exam.passingQuestion,
      submitTime = exam.submitTime,
      reDoTime = exam.reDoTime,
    } = req.body;
    if (numberQuestion <= 0) {
      return res.status(400).json("Số lượng câu hỏi không hợp lệ!");
    }
    if (passingQuestion <= 0 || passingQuestion > numberQuestion) {
      return res.status(400).json("Câu trả lời đúng tối thiểu không hợp lệ!");
    }
    submitTime < 10 ? 10 : submitTime;
    reDoTime < 0 ? 0 : reDoTime;

    await exam.update({
      name,
      numberQuestion,
      passingQuestion,
      submitTime,
      reDoTime,
    });
    return res.json("update exam successfull");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DeleteExam = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json();
    }
    await exam.destroy();
    return res.json("Delete Ẽxam successfull");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AddQuestions = async (req: Request, res: Response) => {
  uploadExcell.single("file")(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json(err.message);
    }

    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json("File không tồn tại hoặc không hợp lệ!");
      }

      const exam_id = req.params.exam_id;
      let exam = await Exam.findByPk(exam_id, { raw: true });

      if (!exam) {
        return res.status(404).json("Exam không tồn tại!");
      }

      // Đọc file Excel từ buffer
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const questionsData = XLSX.utils.sheet_to_json(worksheet);

      const questions = questionsData.map((row: any) => {
        let choice = JSON.parse(row.choice); // Chuyển đổi chuỗi thành JSON nếu cần
        let correctAns = JSON.parse(row.correctAns); // Chuyển đổi chuỗi thành JSON nếu cần

        return {
          name: row.name,
          type: row.type,
          choice,
          correctAns,
          exam_id: exam.id,
        };
      });

      await ExamQuestion.bulkCreate(questions);

      return res.status(200).json({
        message: "Thêm danh sách câu hỏi thành công!",
      });
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const AddQuestion = async (req: Request, res: Response) => {
  try {
    const exam_id = req.params.exam_id;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Exam khoong ton tai");
    }
    const { name, type, choice, correctAns } = req.body;
    if (
      !name ||
      !type ||
      !Array.isArray(choice) ||
      !Array.isArray(correctAns)
    ) {
      return res.status(400).json("Dữ liệu không hợp lệ");
    }
    await ExamQuestion.create({ name, type, choice, correctAns, exam_id });
    return res.json("Tao cau hoi thanh cong ");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailQuestion = async (req: Request, res: Response) => {
  try {
    const question_id = req.params.question_id;

    const question = await ExamQuestion.findByPk(question_id, {
      attributes: ["id", "name", "type", "choice", "correctAns"],
      raw: true,
    });
    if (!question) {
      return res.json("Question not exist");
    }
    const parsedQuestion = {
      ...question,
      choice:
        typeof question.choice === "string"
          ? JSON.parse(question.choice)
          : question.choice,
      correctAns:
        typeof question.correctAns === "string"
          ? JSON.parse(question.correctAns)
          : question.correctAns,
    };

    return res.json(parsedQuestion);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateQuestion = async (req: Request, res: Response) => {
  try {
    const question_id = req.params.question_id;
    const question = await ExamQuestion.findByPk(question_id);
    if (!question) {
      return res.status(404).json("Question khong ton tai");
    }
    const {
      name = question.name,
      type = question.type,
      choice = typeof question.choice === "string"
        ? JSON.parse(question.choice)
        : question.choice,
      correctAns = typeof question.correctAns === "string"
        ? JSON.parse(question.correctAns)
        : question.correctAns,
    } = req.body;

    await question.update({ name, type, choice, correctAns });

    return res.json("Sua Cau hoi thanh cong");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DeleteQuestion = async (req: Request, res: Response) => {
  try {
    const question_id = req.params.question_id;
    const question = await ExamQuestion.findByPk(question_id);
    if (!question) {
      return res.status(404).json("Question khong ton tai");
    }
    await question.destroy();
    return res.json("Xoa cau hoi thanh cong");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AttendExam = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const exam_id = req.params.exam_id;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Exam khong ton taji");
    }
    const sub = await CourseSub.findOne({
      where: { student_id: user.id, course_id: exam.course_id },
      raw: true,
    });
    if (!sub) {
      return res.status(403).json("Ban chua dang ky khoa hoc nay!");
    }
    const countDoing = await ExamResult.count({
      where: {
        exam_id: exam.id,
        student_id: user.id,
      },
    });
    if (exam.reDoTime > 0 && countDoing >= exam.reDoTime) {
      return res.status(403).json("Ban da het luot lam lai bai thi nay!");
    }
    const questions = await ExamQuestion.findAll({
      order: Sequelize.literal("RAND()"),
      limit: exam.numberQuestion,
      where: { exam_id },
      attributes: ["id", "name", "type", "choice", "correctAns"],
      raw: true,
    });
    const saveQuestion = questions.map((question: any) => {
      let { choice, correctAns, ...rest } = question;
      choice = choice =
        typeof choice === "string" ? JSON.parse(choice) : choice;
      correctAns = correctAns =
        typeof correctAns === "string" ? JSON.parse(correctAns) : correctAns;
      let answer: string[] = [];
      return { ...rest, choice, correctAns, answer };
    });
    const dataQuestion = questions.map((question: any) => {
      let { choice, correctAns, ...rest } = question;
      choice = choice =
        typeof choice === "string" ? JSON.parse(choice) : choice;
      return { ...rest, choice };
    });

    const subimt = await ExamResult.create({
      student_id: user.id,
      exam_id: exam.id,
      detailResult: saveQuestion,
    });
    return res.json({ test: subimt.id, dataQuestion });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const SubmitExam = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result_id = req.params.result_id;
    const result = await ExamResult.findOne({
      where: {
        id: result_id,
        student_id: user.id,
      },
    });
    if (!result) {
      return res
        .status(400)
        .json("Bai lam khong ton tai hoac khong phai cua ban!");
    }
    if (result.submitAt) {
      return res.status(403).json("Bai lam da duoc nopj");
    }
    const { answers } = req.body;
    let score = 0;
    let checks =
      typeof result.detailResult === "string"
        ? JSON.parse(result.detailResult)
        : result.detailResult;
    const newDetail: any = checks.map((check: any, index: number) => {
      let { answer, correctAnswer, ...rest } = check;
      let userAns = answers[index]?.selectedAns;
      if (userAns) {
        const isTrue = _.difference(userAns, correctAnswer);
        score += isTrue ? 1 : 0;
      }
      answer = userAns ? userAns : [];
      return { answer, correctAnswer, ...rest };
    });
    await result.update({
      correctAns: score,
      detailResult: newDetail,
      submitAt: Date.now(),
    });
    return res.json({ result });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};
