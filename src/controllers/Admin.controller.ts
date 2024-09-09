import { Request, Response } from "express";
import {
  isExist,
  updateAdmin,
  listAdmin,
  addAdmin,
} from "../services/Admin.service";
import { decryptString, encryptString } from "../helpers/cryptHash";
import { sendResetEmail } from "../helpers/sendingEmail";
import { bcryptDecrypt, bcryptEncrypt } from "../helpers/bcryptHash";
import { error } from "console";

let ResetPasswordlist: string[] = [];

export const GetListAdmin = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "" } = req.query;
    key_name = typeof key_name === "string" ? key_name : "";
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const offset = (page - 1) * limit;
    const result = await listAdmin(limit, offset, key_name);
    return res.json({ result });
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
    const resetString = req.params.reset;
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
    await updateAdmin(student.id, {
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

export const CreateAdmin = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      course_permission = 0,
      student_permission = 0,
    } = req.body;
    const exist = await isExist(undefined, email);
    if (exist) {
      return res.status(409).json({ error: "Email đã tồn tại trong hệ thống" });
    }
    const hashPassword = await bcryptEncrypt(password);
    await addAdmin(
      fullName,
      email,
      hashPassword,
      course_permission,
      student_permission
    );
    return res.json({ message: "Tạo tài khoản thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.admin_id;
    const admin = await isExist(parseInt(id));
    if (!admin) {
      return res.status(404).json({ error: "Không tìm thấy Admin" });
    }
    await admin.update({ status: !admin.status });
    return res.json({ message: "Cập nhật status thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdatePermission = async (req: Request, res: Response) => {
  try {
    const { course_permission = 0, student_permission = 0 } = req.body;
    const id = req.params.id;
    const admin = await isExist(parseInt(id));
    if (!admin) {
      return res.status(404).json({ error: "Không tìm thấy admin!" });
    }
    await admin.update({ course_permission, student_permission });
    return res.json({ message: "Đã cập nhật quyền cho admin!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const MyInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const admin = await isExist(user.id);
    return res.json({ my_info: admin });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const UpdateMyInfo = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = (req as any).user;
    const admin = await isExist(user.id);
    await admin?.update({ email });
    return res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { current_password, new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.status(401).json({ error: "Xác nhận mật khẩu không đúng!" });
    }
    const admin = await isExist(parseInt(user.id));
    if (!admin) {
      return res.status(500).json({ error: "Server đang bị lỗi!" });
    }
    const isPass = await bcryptDecrypt(current_password, admin.hashPassword);
    if (!isPass) {
      return res
        .status(401)
        .json({ error: "Mật khẩu hiện tại cảu bạn không đúng!" });
    }
    const hashPassword = await bcryptEncrypt(new_password);
    await admin.update({ hashPassword });
    return res.json({ message: "Cập nhật mật khẩu thành công!" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
