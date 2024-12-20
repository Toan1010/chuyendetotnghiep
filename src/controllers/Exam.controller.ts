import { Request, Response } from "express";
import Topic from "../models/Topic.Model";
import Exam from "../models/Exam.Model";
import ExamQuestion from "../models/ExamQuestion.Model";

import { uploadExcell } from "../configurations/multer";
import XLSX from "xlsx";
import { Op, Sequelize, where } from "sequelize";
import ExamResult from "../models/ExamResult.Model";
import { changeTime } from "../helpers/formatTime";
import Student from "../models/Student.Model";
import _ from "lodash";
import { convertString } from "../helpers/convertToSlug";
import { isEqualArrays } from "../helpers/checkCorrect";

export const ListExam = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "", topic_id = null } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const topicCondition = topic_id ? { id: topic_id } : {};
    const whereCondition: any = {
      [Op.or]: [{ name: { [Op.like]: `%${key_name}%` } }],
    };
    const { count, rows: exams } = await Exam.findAndCountAll({
      limit,
      offset,
      attributes: [
        "id",
        "name",
        "slug",
        "passingQuestion",
        "numberQuestion",
        "reDoTime",
        "submitTime",
        "studentDid",
        "createdAt",
      ],
      where: whereCondition,
      include: [
        {
          model: Topic,
          as: "topic",
          attributes: ["id", "slug", "name"],
          where: topicCondition,
        },
      ],
      order: [["updatedAt", "DESC"]],
      nest: true,
      raw: true,
    });

    let format = exams.map((item: any) => {
      let { createdAt, id, ...rest } = item;
      createdAt = changeTime(createdAt);

      return { id, ...rest, createdAt };
    });
    return res.json({ count, exams: format });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AllQuestionOnExam = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const exam = await Exam.findOne({ where: { slug: slug } });
    if (!exam) {
      return res.status(404).json("Exam khong ton taji");
    }
    let { limit = 15, page = 1, key_name = "" } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const whereCondition: any = {
      exam_id: exam.id,
      [Op.or]: [{ name: { [Op.like]: `%${key_name}%` } }],
    };
    const { count, rows: questions } = await ExamQuestion.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: ["id", "name", "type", "choice", "correctAns"],
      order: [["id", "DESC"]],
      raw: true,
    });
    const format = questions.map((question: any) => {
      let { choice, correctAns, ...rest } = question;
      choice = choice =
        typeof choice === "string" ? JSON.parse(choice) : choice;
      correctAns = correctAns =
        typeof correctAns === "string" ? JSON.parse(correctAns) : correctAns;
      return { ...rest, choice, correctAns };
    });
    return res.json({ count, questions: format });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const ListStudentAttend = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const exam = await Exam.findOne({ where: { slug } });
    if (!exam) {
      return res.status(404).json("Exam khong ton taji");
    }
    let { limit = 10, page = 1, key_name = "" } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;

    const { count, rows: students } = await ExamResult.findAndCountAll({
      limit,
      offset,
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("student_id")), "attempt_count"],
        [Sequelize.fn("MAX", Sequelize.col("correctAns")), "highest_score"],
      ],
      where: { exam_id: exam.id },
      include: [
        {
          model: Student,
          as: "student",
          attributes: ["id", "fullName"],
          where: { fullName: { [Op.like]: `%${key_name}%` } },
        },
      ],
      group: ["student_id"],
      nest: true,
      raw: true,
    });

    const format = students.map((item: any) => {
      let { highest_score, ...rest } = item;
      highest_score = (highest_score * 10) / exam.numberQuestion;
      return { highest_score, ...rest };
    });

    return res.json({ count: count.length, students: format });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const AllExamResult = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    let { limit = 10, page = 1, key_name = "", student_id } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;

    const exam = await Exam.findOne({ where: { slug } });

    if (!exam) {
      return res.status(404).json("Bài kiểm tra không tồn tại");
    }

    const user = (req as any).user;
    let whereCondition: any = {
      exam_id: exam.id,
    };

    // Kiểm tra role của người dùng
    if (user.role === 0) {
      // Sinh viên chỉ được xem kết quả của chính mình
      whereCondition.student_id = user.id;
    } else if (user.role !== 0) {
      // Nếu không phải sinh viên và có student_id trong query, lọc theo student_id
      if (student_id) {
        whereCondition.student_id = student_id;
      }
    }

    // Lấy kết quả thi kèm theo thông tin sinh viên
    const { count, rows: results } = await ExamResult.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: [
        "id",
        "isPass",
        "point",
        "correctAns",
        "createdAt",
        "submitAt",
      ],
      order: [["id", "DESC"]],
      include: [
        {
          model: Student,
          as: "student", // alias cho bảng Student
          attributes: ["id", "fullName"], // lấy thuộc tính 'name' của Student
          where: {
            fullName: { [Op.like]: `%${key_name}%` },
          },
        },
      ],
      nest: true,
      raw: true,
    });

    const format = results.map((result: any) => {
      let { createdAt, submitAt, ...rest } = result;
      createdAt = changeTime(createdAt); // Định dạng lại thời gian
      submitAt = submitAt ? changeTime(submitAt) : "";
      return { ...rest, createdAt, submitAt };
    });

    return res.json({ count, results: format });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailResultExam = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result_id = req.params.result_id;
    const result: any = await ExamResult.findByPk(result_id, {
      attributes: [
        "id",
        "correctAns",
        "point",
        "isPass",
        "detailResult",
        "createdAt",
        "submitAt",
      ],
      include: [
        { model: Student, as: "student", attributes: ["id", "fullName"] },
        {
          model: Exam,
          as: "exam",
          attributes: ["id", "name", "slug", "submitTime"],
        },
      ],
      raw: true,
      nest: true,
    });
    if (!result) {
      return res.status(404).json("Kết quả bài làm không tồn tại!");
    }
    if (user.role == 0 && (result as any).student.id != user.id) {
      return res.status(403).json("Bài làm không phải của bạn!");
    }

    const currentTime = Date.now();
    const examEndTime =
      new Date(result.createdAt).getTime() + result.exam.submitTime * 60 * 1000;

    if (!result.submitAt && currentTime > examEndTime) {
      // Parse detailResult if it’s stored as a string
      let updatedDetailResult =
        typeof result.detailResult === "string"
          ? JSON.parse(result.detailResult)
          : result.detailResult;

      // Automatically submit the exam if the deadline has passed
      updatedDetailResult = updatedDetailResult.map((check: any) => ({
        ...check,
        answer: [],
      }));

      await ExamResult.update(
        {
          correctAns: 0,
          detailResult: updatedDetailResult,
          submitAt: examEndTime,
        },
        { where: { id: result_id } }
      );

      result.submitAt = examEndTime;
      result.correctAns = 0;
      result.detailResult = updatedDetailResult;
    }

    let { detailResult, submitAt, createdAt, ...rest } = result as any;

    detailResult =
      typeof detailResult === "string"
        ? JSON.parse(detailResult)
        : detailResult;
    createdAt = changeTime(createdAt);
    if (!submitAt) {
      detailResult = detailResult?.map((item: any) => {
        let { correctAns, ...rest } = item;
        return rest;
      });
    }
    submitAt = submitAt ? changeTime(submitAt) : "";

    return res.json({ ...rest, detailResult, createdAt, submitAt });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailExam = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;
    const exam = await Exam.findOne({
      attributes: [
        "id",
        "name",
        "slug",
        "numberQuestion",
        "passingQuestion",
        "submitTime",
        "reDoTime",
        "studentDid",
        "createdAt",
        "updatedAt",
      ],
      where: { slug },
      include: [
        {
          model: Topic,
          as: "topic",
          attributes: ["id", "name", "slug"],
        },
      ],
      nest: true,
      raw: true,
    });
    if (!exam) {
      return res.status(404).json("Bài kiểm tra không tồn tại!");
    }
    let { createdAt, updatedAt, ...rest } = exam as any;
    createdAt = changeTime(createdAt);
    updatedAt = changeTime(updatedAt);
    return res.json({ ...rest, createdAt, updatedAt });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CreateExam = async (req: Request, res: Response) => {
  try {
    let {
      name,
      numberQuestion,
      passingQuestion,
      submitTime,
      reDoTime,
      topic_id,
    } = req.body;
    if (numberQuestion <= 0) {
      return res.status(400).json("Số lượng câu hỏi không hợp lệ!");
    }
    if (passingQuestion <= 0 || passingQuestion > numberQuestion) {
      return res.status(400).json("Câu trả lời đúng tối thiểu không hợp lệ!");
    }
    submitTime <= 20 ? 20 : submitTime;
    reDoTime < 0 ? 0 : reDoTime;
    const slug = convertString(name);

    await Exam.create({
      name,
      numberQuestion,
      passingQuestion,
      submitTime,
      reDoTime,
      topic_id,
      slug,
    });
    return res.json("Tạo bài kiểm tra thành công!");
  } catch (error: any) {
    if (error?.errors[0].message == "name must be unique") {
      return res.status(409).json("Tên bài kiểm tra đã tồn tại!");
    }
    return res.status(500).json(error.message);
  }
};

export const UpdateExam = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Bài kiểm tra không tồn tại!");
    }
    let {
      name = exam.name,
      numberQuestion = exam.numberQuestion,
      passingQuestion = exam.passingQuestion,
      submitTime = exam.submitTime,
      topic_id = exam.topic_id,
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
    const slug = convertString(name);
    await exam.update({
      name,
      numberQuestion,
      passingQuestion,
      submitTime,
      topic_id,
      reDoTime,
      slug,
    });
    return res.json("Sửa thông tin bài kiểm tra thành công!");
  } catch (error: any) {
    if (error?.errors[0].message == "name must be unique") {
      return res.status(409).json("Tên bài kiểm tra đã tồn tại!");
    }
    return res.status(500).json(error.message);
  }
};

export const DeleteExam = async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;
    const exam = await Exam.findByPk(exam_id);
    if (!exam) {
      return res.status(404).json("Bài kiểm tra không tồn tại!");
    }
    await exam.destroy();
    return res.json("Xóa bài kiểm tra thành công!");
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
        return res.status(404).json("Bài kiểm tra không tồn tại!");
      }

      // Đọc file Excel từ buffer
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const questionsData = XLSX.utils.sheet_to_json(worksheet);

      const questions = questionsData.map((row: any) => {
        let choice = JSON.parse(row.choice); // Chuyển đổi chuỗi thành JSON nếu cần
        let correctAns = JSON.parse(row.correctAns); // Chuyển đổi chuỗi thành JSON nếu cần

        // Kiểm tra nếu loại câu hỏi là radio
        if (row.type === "radio") {
          if (correctAns.length !== 1) {
            throw new Error(
              `Câu hỏi "${row.name}" loại radio chỉ được phép có 1 đáp án đúng`
            );
          }

          if (!choice.includes(correctAns[0])) {
            throw new Error(
              `Đáp án đúng của câu hỏi "${row.name}" không nằm trong danh sách các lựa chọn`
            );
          }
        }

        // Kiểm tra nếu loại câu hỏi là checkbox
        if (row.type === "checkbox") {
          const isValidAnswers = correctAns.every((ans: string) =>
            choice.includes(ans)
          );
          if (!isValidAnswers) {
            throw new Error(
              `Tất cả đáp án đúng của câu hỏi "${row.name}" phải nằm trong danh sách các lựa chọn`
            );
          }
        }

        return {
          name: row.name,
          type: row.type,
          choice,
          correctAns,
          exam_id: exam.id,
        };
      });

      // Lưu danh sách câu hỏi vào cơ sở dữ liệu
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
      return res.status(404).json("Exam không tồn tại");
    }

    const { name, type, choice, correctAns } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (
      !name ||
      !type ||
      !Array.isArray(choice) ||
      !Array.isArray(correctAns)
    ) {
      return res.status(400).json("Dữ liệu không hợp lệ");
    }

    // Nếu là radio thì chỉ cho phép 1 đáp án đúng
    if (type === "radio") {
      if (correctAns.length !== 1) {
        return res
          .status(400)
          .json("Câu hỏi loại radio chỉ được phép có 1 đáp án đúng");
      }

      // Kiểm tra nếu đáp án đúng có nằm trong danh sách các lựa chọn
      if (!choice.includes(correctAns[0])) {
        return res
          .status(400)
          .json("Đáp án đúng không nằm trong danh sách các lựa chọn");
      }
    }

    // Nếu là checkbox thì các đáp án đúng phải nằm trong danh sách các lựa chọn
    if (type === "checkbox") {
      const isValidAnswers = correctAns.every((ans: string) =>
        choice.includes(ans)
      );
      if (!isValidAnswers) {
        return res
          .status(400)
          .json("Tất cả đáp án đúng phải nằm trong danh sách các lựa chọn");
      }
    }

    // Tạo câu hỏi
    await ExamQuestion.create({ name, type, choice, correctAns, exam_id });
    return res.json("Tạo câu hỏi thành công");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DetailQuestion = async (req: Request, res: Response) => {
  try {
    const question_id = req.params.question_id;

    const question = await ExamQuestion.findByPk(question_id, {
      raw: true,
    });
    if (!question) {
      return res.status(404).json("Câu hỏi không tồn tại");
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
      return res.status(404).json("Câu hỏi không tồn tại");
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

    // Kiểm tra nếu loại câu hỏi là radio
    if (type === "radio") {
      if (correctAns.length !== 1) {
        return res
          .status(400)
          .json(`Câu hỏi loại radio chỉ được phép có 1 đáp án đúng`);
      }

      if (!choice.includes(correctAns[0])) {
        return res
          .status(400)
          .json(`Đáp án đúng không nằm trong danh sách các lựa chọn`);
      }
    }

    // Kiểm tra nếu loại câu hỏi là checkbox
    if (type === "checkbox") {
      const isValidAnswers = correctAns.every((ans: string) =>
        choice.includes(ans)
      );
      if (!isValidAnswers) {
        return res
          .status(400)
          .json(`Tất cả đáp án đúng phải nằm trong danh sách các lựa chọn`);
      }
    }

    // Cập nhật câu hỏi
    await question.update({ name, type, choice, correctAns });

    return res.json("Cập nhật câu hỏi thành công");
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
    const slug = req.params.slug;
    const exam = await Exam.findOne({ where: { slug } });
    if (!exam) {
      return res.status(404).json("Bài kiểm tra không tồn tại");
    }

    const countDoing = await ExamResult.count({
      where: {
        exam_id: exam.id,
        student_id: user.id,
      },
    });
    const isAttendNow = await ExamResult.findOne({
      where: {
        student_id: user.id,
        exam_id: exam.id,
        submitAt: null,
      },
    });
    if (isAttendNow) {
      return res
        .status(401)
        .json("Vui lòng hoàn thành bài thi hiện tại trước!");
    }
    if (exam.reDoTime > 0 && countDoing >= exam.reDoTime) {
      return res.status(403).json("Bạn đã hết lượt làm bài kiểm tra này!");
    }
    if (countDoing == 0) {
      await exam.update({ studentDid: exam.studentDid + 1 });
    }
    const questions = await ExamQuestion.findAll({
      order: Sequelize.literal("RAND()"),
      limit: exam.numberQuestion,
      where: { exam_id: exam.id },
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
      let isCorrect: boolean = false;
      return { ...rest, choice, correctAns, answer, isCorrect };
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
      return res.status(400).json("Bài làm không phải của bạn!");
    }
    if (result.submitAt) {
      return res.status(403).json("Bài làm đã được nộp!");
    }

    const exam = await Exam.findByPk(result.exam_id);
    if (!exam) {
      return res.status(404).json("Bài thi không tồn tại!");
    }
    // Kiểm tra thời gian hiện tại và thời gian nộp bài
    const currentTime = Date.now();
    const examEndTime =
      new Date((result as any).createdAt).getTime() +
      (exam as any).submitTime * 60 * 1000;

    if (currentTime > examEndTime) {
      // Nếu quá thời gian, mặc định tất cả câu trả lời rỗng
      await result.update({
        correctAns: 0,
        detailResult: result?.detailResult
          ? JSON.parse((result as any).detailResult).map((check: any) => ({
              ...check,
              answer: [],
            }))
          : [],
        submitAt: currentTime,
      });

      return res.status(403).json("Đã quá thời gian nộp bài.");
    }

    const { answers } = req.body;
    let score = 0;
    let checks =
      typeof result.detailResult === "string"
        ? JSON.parse(result.detailResult)
        : result.detailResult || [];

    const newDetail = checks.map((check: any, index: number) => {
      let { answer, correctAns, isCorrect, ...rest } = check;
      let userAns = answers[index]?.selectedAns;

      if (userAns && userAns.length > 0) {
        const isTrue = isEqualArrays(userAns, correctAns);
        score += isTrue ? 1 : 0;
        isCorrect = isTrue;
      }
      answer = userAns || [];
      return { answer, correctAns, isCorrect, ...rest };
    });

    let isPass: boolean = score >= exam.passingQuestion;
    let point: number = (score / exam.numberQuestion) * 10;

    await result.update({
      point,
      isPass,
      correctAns: score,
      detailResult: newDetail,
      submitAt: currentTime,
    });
    let { detailResult, submitAt, createdAt, ...rest } =
      result.dataValues as any;

    detailResult =
      typeof detailResult === "string"
        ? JSON.parse(detailResult)
        : detailResult;
    createdAt = changeTime(createdAt);
    submitAt = submitAt ? changeTime(submitAt) : "";

    return res.json({ ...rest, detailResult, createdAt, submitAt });
  } catch (error: any) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

export const ExamHaveDone = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    let {
      limit = 10,
      page = 1,
      key_name = "",
      topic_id = null,
      student_id,
    } = req.query;

    // Parse các tham số truy vấn
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;

    // Điều kiện tìm kiếm
    const whereCondition: any = {
      [Op.or]: [{ name: { [Op.like]: `%${key_name}%` } }],
    };

    // Kiểm tra và thêm điều kiện topic_id nếu có
    if (topic_id) {
      whereCondition.topic_id = topic_id;
    }
    if (user.role === 0) {
      student_id = user.id;
    } else {
      if (!student_id) {
        return res.status(400).json("Chọn sinh viên muốn xem");
      }
    }

    const { count, rows: exams } = await Exam.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      include: [
        {
          model: ExamResult,
          as: "result",
          where: { student_id },
          attributes: [],
        },
        {
          model: Topic,
          as: "topic",
          attributes: ["id", "name", "slug"],
        },
      ],
      attributes: [
        "id",
        "name",
        "slug",
        "submitTime",
        "reDoTime",
        "studentDid",
        "createdAt",
        "updatedAt",
      ],
      group: ["Exam.id"],
    });
    let format = exams.map((item: any) => {
      let { createdAt, updatedAt, ...rest } = item.get({ plain: true });
      createdAt = changeTime(createdAt);
      updatedAt = changeTime(updatedAt);
      return { ...rest, createdAt, updatedAt };
    });
    return res.json({ count: count.length, exams: format });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
