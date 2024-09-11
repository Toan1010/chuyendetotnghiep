import { Request, Response } from "express";
import Student from "../models/Student.Model";
import Admin from "../models/Admin.model";
import { bcryptDecrypt } from "../helpers/bcryptHash";
import { tokenGenerate, tokenVerify } from "../helpers/tokenHandle";

let refreshTokenlist: string[] = [];
const roleMap: { [key: string]: number } = {
  super_admin: 2,
  normal_admin: 1,
};

export const LoginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const isExist = await Student.findOne({ where: { email } });
    if (!isExist) {
      return res.status(404).json("Thông tin Email chưa chính xác!");
    }
    const isPassword = await bcryptDecrypt(password, isExist.hashPassword);
    if (!isPassword) {
      return res.status(400).json("Mật khẩu không đúng");
    }
    if (!isExist.status) {
      return res.status(403).json("Tài khoản của bạn đang bị khóa!");
    }
    let tokenData = { id: isExist.id, role: 0 };

    const accessToken = tokenGenerate(tokenData, "access");
    const refreshToken = tokenGenerate(tokenData, "refresh");
    refreshTokenlist.push(refreshToken);

    return res.json({ accessToken, refreshToken });
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const LoginAdmin = async (req: Request, res: Response) => {
  try {
    try {
      const { email, password } = req.body;
      const isExist = await Admin.findOne({ where: { email } });
      if (!isExist) {
        return res.status(404).json("Thông tin Email chưa chính xác!");
      }
      const isPassword = await bcryptDecrypt(password, isExist.hashPassword);
      if (!isPassword) {
        return res.status(400).json("Mật khẩu không đúng");
      }

      if (!isExist.status) {
        return res.status(403).json("Tài khoản của bạn đang bị khóa!");
      }
      let tokenData = { id: isExist.id, role: roleMap[isExist.role] };

      const accessToken = tokenGenerate(tokenData, "access");
      const refreshToken = tokenGenerate(tokenData, "refresh");
      refreshTokenlist.push(refreshToken);

      return res.json({ accessToken, refreshToken });
    } catch (error: any) {
      return res.status(500).json(error.message);
    }
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const RefreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshTokenlist.includes(refreshToken)) {
      return res.status(403).json("Refresh token không hợp lệ");
    }
    const data = await tokenVerify(refreshToken, "refresh");
    if (data && typeof data === "object") {
      const newAccessToken = tokenGenerate(data, "access");
      const newRefreshToken = tokenGenerate(data, "refresh");
      refreshTokenlist = refreshTokenlist.filter(
        (token) => token !== refreshToken
      );
      refreshTokenlist.push(newRefreshToken);
      return res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } else {
      return res.status(403).json("Dữ liệu token không hợp lệ");
    }
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};

export const Logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshTokenlist.includes(refreshToken)) {
      refreshTokenlist = refreshTokenlist.filter(
        (token) => token !== refreshToken
      );
      return res.status(200).json("Logged out successfully!");
    } else {
      return res.status(403).json("Refresh Token không hợp lệ!");
    }
  } catch (error: any) {
    return res.status(500).json(error.message);
  }
};
