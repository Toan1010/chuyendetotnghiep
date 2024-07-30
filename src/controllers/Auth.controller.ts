import { Request, Response } from "express";
import { getAdminbyEmail } from "../services/Admin.service";
import { bcryptDecrypt, bcryptEncrypt } from "../helpers/bcryptHash";
import { TokenPayload } from "../type";
import { tokenGenerate, tokenVerify } from "../helpers/tokenHandle";
import { changePassword, getStudentbyEmail } from "../services/Student.service";
import { decrypt, encrypt } from "../helpers/cryptHash";
import { sendResetEmail } from "../helpers/sendingEmail";

let refreshTokenlist: string[] = [];
let ResetPasswordlist: string[] = [];

export const LoginStudent = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const student = await getStudentbyEmail(email);
    if (!student) {
      return res.status(500).json({ message: "Invalid Credential!" });
    }
    const isPassword = bcryptDecrypt(password, student.hash_password);
    if (!isPassword) {
      return res.status(500).json({ message: "Invalid Credential!" });
    }
    const tokendata: TokenPayload = {
      id: student.id,
      name: student.student_name,
      role: "student",
    };
    const accessToken = tokenGenerate(tokendata, "access");
    const refreshToken = tokenGenerate(tokendata, "refresh");
    refreshTokenlist.push(refreshToken);
    return res.json({ accessToken, refreshToken });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({ error: error.message });
  }
};

export const LoginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await getAdminbyEmail(email);
    if (!admin) {
      return res.status(500).json({ message: "Invalid Credential!" });
    }
    const isPassword = bcryptDecrypt(password, admin.hash_password);
    if (!isPassword) {
      return res.status(500).json({ message: "Invalid Credential!" });
    }
    const tokendata: TokenPayload = {
      id: admin.id,
      name: admin.admin_name,
      role: admin.role,
    };
    const accessToken = tokenGenerate(tokendata, "access");
    const refreshToken = tokenGenerate(tokendata, "refresh");
    refreshTokenlist.push(refreshToken);
    return res.json({ accessToken, refreshToken });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({ error: error.message });
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
  } catch (error) {
    console.error("Lỗi làm mới token:", error);
    return res.status(500).json("Có lỗi xảy ra trong quá trình làm mới token");
  }
};

export const Logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      if (refreshTokenlist.includes(refreshToken)) {
        refreshTokenlist = refreshTokenlist.filter(
          (token) => token !== refreshToken
        );
        return res.status(200).json("Logged out successfully!");
      } else {
        return res.status(403).json("Refresh token không hợp lệ");
      }
    } else {
      return res.status(400).json("No refresh token provided");
    }
  } catch (error) {
    console.error("Error during logout:", error);
    return res.status(500).json("An error occurred during logout");
  }
};

export const ForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email không được cung cấp" });
    }
    const student = await getStudentbyEmail(email);
    if (!student) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sinh viên với email này" });
    }
    const data = { email: email, expired: new Date(Date.now() + 3600000) };
    const dataString = JSON.stringify(data);
    const resetString = encrypt(dataString);
    ResetPasswordlist.push(resetString);
    await sendResetEmail(email, resetString);
    return res
      .status(200)
      .json({ resetString, message: "sendMessage successfully!" });
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý quên mật khẩu:", error);
    return res
      .status(500)
      .json({ message: "Có lỗi xảy ra trong quá trình xử lý quên mật khẩu" });
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  try {
    const resetString = req.params.id;
    const { password } = req.body;
    const { email, expired } = decrypt(resetString);

    //check if
    if (!ResetPasswordlist.includes(resetString)) {
      return res.status(403).json({ message: "Reset token invalid" });
    }
    if (new Date() > new Date(expired)) {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    const newPassword = await bcryptEncrypt(password);
    const success = await changePassword(email, newPassword);
    if (success) {
      ResetPasswordlist = ResetPasswordlist.filter(
        (token) => token !== resetString
      );
      return res.json({ message: "Password has been reset successfully" });
    } else {
      return res.status(500).json({ message: "Error updating password" });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
