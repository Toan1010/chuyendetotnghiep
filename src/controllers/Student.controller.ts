import { Request, Response } from "express";

import { avatarUpload, uploadExcell } from "../configurations/multer";
import multer from "multer";
import XLSX from "xlsx";
import fs from "fs/promises";

import { bcryptDecrypt, bcryptEncrypt } from "../helpers/bcryptHash";
import { decryptString, encryptString } from "../helpers/cryptHash";
import { sendResetEmail } from "../helpers/sendingEmail";
import Student from "../models/Student.Model";
import { Op } from "sequelize";
import path from "path";

let ResetPasswordlist: string[] = [];

export const GetListStudent = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "", order = "true" } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const whereCondition: any = {
      [Op.or]: [{ fullName: { [Op.like]: `%${key_name}%` } }],
    };
    const orderDirection = order === "false" ? "DESC" : "ASC";
    const { count, rows: students } = await Student.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: ["id", "fullName", "email", "status", "createdAt"],
      order: [["id", orderDirection]],
    });
    return res.json({ count, students });
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const CreateStudent = async (req: Request, res: Response) => {
  avatarUpload.single("avatar")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    const avatar = req.file?.originalname || "avatar.png";
    try {
      const { fullName, email, password } = req.body;
      const exist = await Student.findOne({ where: { email } });
      if (exist) {
        return res.status(409).json("Email đã tồn tại!");
      }
      const hashPassword = await bcryptEncrypt(password);
      await Student.create({ fullName, email, hashPassword, avatar });
      return res.json("Create new student successfully!");
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  });
};

export const ChangeStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.student_id;
    const student = await Student.findByPk(parseInt(id));
    const { status } = req.body;
    if (!student) {
      return res.status(404).json("Student không tồn tại!");
    }
    await student.update({ status });
    return res.json("Thay đổi trạng thái student thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const CreateStudentBulk = async (req: Request, res: Response) => {
  uploadExcell.single("file")(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json(err.message);
    }
    try {
      if (!req.file) {
        return res.status(400).json("File không tồn tại hoặc không hợp lệ");
      }

      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const students: any[] = XLSX.utils.sheet_to_json(sheet);
      let addedStudents: any[] = [];
      let skippedStudents: any[] = [];
      for (const studentData of students) {
        const { fullName, email, password, avatar } = studentData;
        try {
          const hashPassword = await bcryptEncrypt(password);
          await Student.create({ fullName, email, hashPassword, avatar });
          addedStudents.push(fullName);
        } catch (createError: any) {
          skippedStudents.push({
            fullName,
            email,
            reason: createError.message,
          });
          continue;
        }
      }
      return res.status(200).json({
        message: "Thêm học sinh thành công",
        addedStudents,
        skippedStudents,
      });
    } catch (error) {
      return res.status(500).json("Đã xảy ra lỗi khi xử lý file");
    }
  });
};

export const MyInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const student = await Student.findByPk(parseInt(user.id), {
      attributes: ["fullName", "email", "avatar", "createdAt"],
    });
    const studentData = student ? student.get({ plain: true }) : null;
    return res.json(studentData);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateMyAcc = async (req: Request, res: Response) => {
  avatarUpload.single("avatar")(req, res, async (err: any) => {
    if (err) {
      const statusCode = err instanceof multer.MulterError ? 400 : 500;
      return res.status(statusCode).json({ message: err.message });
    }

    const user = (req as any).user;
    const student = await Student.findByPk(parseInt(user.id));

    if (!student) {
      return res.status(500).json({ message: "Server đang bị lỗi!" });
    }
    const oldAvatarPath = path.join(
      __dirname,
      "../../public/avatars",
      student.avatar
    );
    const newAvatar = req.file?.filename || student.avatar;

    try {
      const { email } = req.body;

      await student.update({ email, avatar: newAvatar });

      if (req.file?.filename) {
        try {
          await fs.unlink(oldAvatarPath);
        } catch (error: any) {
          console.error("Failed to delete old avatar:", error.message);
        }
      }
      return res.json({ message: "Cập nhật thông tin thành công!" });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
};

export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { current_password, new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.status(401).json("Xác nhận mật khẩu không đúng!");
    }
    const student = await Student.findByPk(parseInt(user.id));
    if (!student) {
      return res.status(500).json("Server đang bị lỗi!");
    }
    const isPass = await bcryptDecrypt(current_password, student.hashPassword);
    if (!isPass) {
      return res.status(401).json("Mật khẩu hiện tại của bạn không đúng!");
    }
    const hashPassword = await bcryptEncrypt(new_password);
    await student.update({ hashPassword });
    return res.json("Cập nhật mật khẩu thành công!");
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.status(404).json("Email này chưa được đăng ký!");
    }
    const data = { email: email, expired: new Date(Date.now() + 3600000) };
    const dataString = JSON.stringify(data);
    const resetString = encryptString(dataString);
    ResetPasswordlist.push(resetString);
    await sendResetEmail(email, resetString);
    return res.status(200).json("Kiểm tra email để thay dổi mật khẩu!");
  } catch (error) {
    return res
      .status(500)
      .json("Có lỗi xảy ra trong quá trình xử lý quên mật khẩu");
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const resetString = req.params.id;
    const { new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.status(401).json("Xác nhận mật khẩu không thành công!");
    }
    if (!ResetPasswordlist.includes(resetString)) {
      return res.status(403).json("Reset string không đúng!");
    }
    const { email, expired } = decryptString(resetString);
    if (new Date() > new Date(expired)) {
      return res.status(400).json("Reset string đã hết hạn!");
    }
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.status(500).json("Lỗi server");
    }
    const newPassword = await bcryptEncrypt(new_password);
    await student.update({
      hashPassword: newPassword,
    });
    ResetPasswordlist = ResetPasswordlist.filter(
      (token) => token !== resetString
    );
    return res.json("Password được cập nhật thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const DeleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.student_id;
    const student = await Student.findByPk(parseInt(id));
    if (!student) {
      return res.status(404).json("Student không tồn tại!");
    }
    await student.destroy();
    return res.json("Xóa student thành công!");
  } catch (error: any) {
    return res.json(error.message);
  }
};
