import { Request, Response } from "express";
import { decryptString, encryptString } from "../helpers/cryptHash";
import { sendResetEmail } from "../helpers/sendingEmail";
import { bcryptDecrypt, bcryptEncrypt } from "../helpers/bcryptHash";
import { Op } from "sequelize";
import Admin from "../models/Admin.model";

let ResetPasswordlist: string[] = [];

export const GetListAdmin = async (req: Request, res: Response) => {
  try {
    let { limit = 10, page = 1, key_name = "", order = true } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    const offset = (page - 1) * limit;
    const whereCondition: any = {
      [Op.or]: [{ fullName: { [Op.like]: `%${key_name}%` } }],
    };
    const orderDirection = order === "false" ? "DESC" : "ASC";

    const { count, rows: admins } = await Admin.findAndCountAll({
      limit,
      offset,
      where: whereCondition,
      attributes: [
        "id",
        "fullName",
        "email",
        "role",
        "course_permission",
        "student_permission",
        "exam_permission",
        "status",
      ],
      order: [["id", orderDirection]],
    });
    return res.json({ count, admins });
  } catch (error: any) {
    return res.json(error.message);
  }
};

export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json("Email chưa được đăng ký!");
    }
    const data = { email: email, expired: new Date(Date.now() + 3600000) };
    const dataString = JSON.stringify(data);
    const resetString = encryptString(dataString);
    ResetPasswordlist.push(resetString);
    await sendResetEmail(email, resetString);
    return res.status(200).json("Kiểm tra email để thay dổi mật khẩu!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const resetString = req.params.reset;
    const { new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.status(401).json("Xác nhận mẩtj khẩu không thành công!");
    }
    if (!ResetPasswordlist.includes(resetString)) {
      return res.status(403).json("Yêu cầu làm mới bị lỗi!");
    }
    const { email, expired } = decryptString(resetString);
    if (new Date() > new Date(expired)) {
      return res.status(400).json("Yêu cầu làm mới đã hết hạn!");
    }
    const admin = await Admin.findOne({ where: { email } });
    const newPassword = await bcryptEncrypt(new_password);
    await admin?.update({
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

export const CreateAdmin = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      course_permission = 0,
      student_permission = 0,
      exam_permission = 0,
    } = req.body;
    const exist = await Admin.findOne({ where: { email } });
    if (exist) {
      return res.status(409).json("Email đã được đăng ký!");
    }
    const hashPassword = await bcryptEncrypt(password);
    await Admin.create({
      fullName,
      email,
      hashPassword,
      course_permission,
      student_permission,
      exam_permission,
    });
    return res.json("Tạo tài khoản thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const admin = await Admin.findByPk(parseInt(id));
    const { status } = req.body;
    if (!admin) {
      return res.status(404).json("Không tìm thấy Admin");
    }
    await admin.update({ status: status });
    return res.json("Thay đổi trạng thái thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdatePermission = async (req: Request, res: Response) => {
  try {
    const {
      course_permission = 0,
      student_permission = 0,
      exam_permission = 0,
    } = req.body;
    const id = req.params.id;
    const admin = await Admin.findByPk(parseInt(id));
    if (!admin) {
      return res.status(404).json("Không tìm thấy admin!");
    }
    await admin.update({
      course_permission,
      student_permission,
      exam_permission,
    });
    return res.json("Đã cập nhật quyền cho admin!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const MyInfo = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const admin = await Admin.findByPk(user.id, {
      attributes: [
        "fullName",
        "email",
        "role",
        "course_permission",
        "student_permission",
        "exam_permission",
      ],
    });
    const adminData = admin ? admin.get({ plain: true }) : null;
    if (adminData) {
      adminData.role = adminData.role === "1" ? "normal_admin" : "super_admin";
    }
    return res.json(adminData);
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const UpdateMyInfo = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = (req as any).user;
    const admin = await Admin.findByPk(user.id);
    await admin?.update({ email });
    return res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const ChangePassword = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { current_password, new_password, confirm_password } = req.body;
    if (new_password !== confirm_password) {
      return res.status(401).json("Xác nhận mật khẩu không đúng!");
    }
    const admin = await Admin.findByPk(parseInt(user.id));
    if (!admin) {
      return res.status(500).json("Server đang bị lỗi!");
    }
    const isPass = await bcryptDecrypt(current_password, admin.hashPassword);
    if (!isPass) {
      return res.status(401).json("Mật khẩu hiện tại của bạn không đúng!");
    }
    const hashPassword = await bcryptEncrypt(new_password);
    await admin.update({ hashPassword });
    return res.json("Cập nhật mật khẩu thành công!");
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
