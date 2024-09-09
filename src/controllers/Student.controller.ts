import { Request, Response } from "express";
import {
  addStudent,
  isExist,
  listStudent,
  updateStudent,
} from "../services/Student.service";
import { avatarUpload, uploadExcell } from "../configurations/multer";
import multer from "multer";
import XLSX from "xlsx";
import { bcryptDecrypt, bcryptEncrypt } from "../helpers/bcryptHash";
import { decryptString, encryptString } from "../helpers/cryptHash";
import { sendResetEmail } from "../helpers/sendingEmail";

let ResetPasswordlist: string[] = [];

export const GetListStudent = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "" } = req.query;
    key_name = typeof key_name === "string" ? key_name : "";
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const offset = (page - 1) * limit;
    const result = await listStudent(limit, offset, key_name);
    return res.json({ result });
  } catch (error: any) {
    return res.json({ error: error.message });
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
      const exist = await isExist(undefined, email);
      if (exist) {
        return res.status(409).json({ error: "Email đã tồn tại!" });
      }
      const hashPassword = await bcryptEncrypt(password);
      await addStudent(fullName, email, hashPassword, avatar);
      return res.json({ message: "Create new student successfully!" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });
};

export const ChangeStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.student_id;
    const student = await isExist(parseInt(id));
    if (!student) {
      return res.status(404).json({ error: "Student không tồn tại!" });
    }
    await updateStudent(parseInt(id), { status: !student.status });
    return res.json({ message: "Khóa student thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const CreateStudentBulk = async (req: Request, res: Response) => {
  uploadExcell.single("file")(req, res, async (err: any) => {
    if (err) {
      return res.status(400).json({ error: "Lỗi khi tải file" });
    }

    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ error: "File không tồn tại hoặc không hợp lệ" });
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
          await addStudent(fullName, email, hashPassword, avatar);
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
      return res.status(500).json({ error: "Đã xảy ra lỗi khi xử lý file" });
    }
  });
};

export const MyInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const student = await isExist(user.id);
    return res.json({ my_info: student });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateMyAcc = async (req: Request, res: Response) => {
  avatarUpload.single("avatar")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    const user = (req as any).user;
    const student = await isExist(parseInt(user.id));
    const avatar = req.file?.path || student?.avatar;
    try {
      const { email } = req.body;
      if (!student) {
        return res.status(500).json({ error: "Server đang bị lỗi!" });
      }
      await updateStudent(parseInt(user.id), { email, avatar });
      return res.json({ message: "Cập nhật thông tin thành công!" });
    } catch (error: any) {
      return res.json({ error: error.message });
    }
  });
};

export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { current_password, new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.status(401).json({ error: "Xác nhận mật khẩu không đúng!" });
    }
    const student = await isExist(parseInt(user.id));
    if (!student) {
      return res.status(500).json({ error: "Server đang bị lỗi!" });
    }
    const isPass = await bcryptDecrypt(current_password, student.hashPassword);
    if (!isPass) {
      return res
        .status(401)
        .json({ error: "Mật khẩu hiện tại cảu bạn không đúng!" });
    }
    const hashPassword = await bcryptEncrypt(new_password);
    await updateStudent(parseInt(user.id), { hashPassword });
    return res.json({ message: "Cập nhật mật khẩu thành công!" });
  } catch (error: any) {
    return res.json({ error: error.message });
  }
};

export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email không được cung cấp" });
    }
    const student = await isExist(undefined, email);
    if (!student) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy sinh viên với email này" });
    }
    const data = { email: email, expired: new Date(Date.now() + 3600000) };
    const dataString = JSON.stringify(data);
    const resetString = encryptString(dataString);
    ResetPasswordlist.push(resetString);
    await sendResetEmail(email, resetString);
    return res
      .status(200)
      .json({ message: "Kiểm tra email để thay dổi mật khẩu!" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra trong quá trình xử lý quên mật khẩu" });
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const resetString = req.params.id;
    const { new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res
        .status(401)
        .json({ error: "Xác nhận mật khẩu không thành công!" });
    }
    if (!ResetPasswordlist.includes(resetString)) {
      return res.status(403).json({ error: "Reset string không đúng!" });
    }
    const { email, expired } = decryptString(resetString);
    if (new Date() > new Date(expired)) {
      return res.status(400).json({ error: "Reset string đã hết hạn!" });
    }
    const student = await isExist(undefined, email);
    if (!student) {
      return res.status(500).json({ error: "Lỗi server" });
    }
    const newPassword = await bcryptEncrypt(new_password);
    await updateStudent(student.id, {
      hashPassword: newPassword,
    });
    ResetPasswordlist = ResetPasswordlist.filter(
      (token) => token !== resetString
    );
    return res.json({ message: "Password được cập nhật thành công!" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const DeleteStudent = async (req: Request, res: Response) => {
  try {
    const id = req.params.student_id;
    const student = await isExist(parseInt(id));
    if (!student) {
      return res.status(404).json({ error: "Student không tồn tại!" });
    }
    await student.destroy();
    return res.json({ message: "Xóa student thành công!" });
  } catch (error: any) {
    return res.json({ error: error.message });
  }
};
