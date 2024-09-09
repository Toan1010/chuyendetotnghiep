import { NextFunction, Request, Response } from "express";
import { tokenVerify } from "../helpers/tokenHandle";
import { coursePermission, studentPermission } from "../services/Admin.service";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token không tồn tại !" });
    }
    const user = await tokenVerify(token, "access");
    if (!user) {
      return res.status(403).json({ error: "Token bị lỗi!" });
    }
    (req as any).user = user;
    next();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

const verifyPermission = async (
  req: Request,
  res: Response,
  next: NextFunction,
  permissionCheck: (userId: number) => Promise<boolean | undefined>
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = (req as any).user;
      if (user.role === 0) {
        return res.status(401).json({
          error: "Đăng nhập với vai trò là Admin để sử dụng chức năng này!",
        });
      }
      if (user.role === 1) {
        const hasPermission = await permissionCheck(user.id);
        if (!hasPermission) {
          return res.status(401).json({
            error: "Không được phân quyền để thực hiện nhiệm vụ này!",
          });
        }
      }
      next();
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const verifyStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = (req as any).user;
      if (user && user.role === 0) {
        return next();
      } else {
        return res.status(403).json({
          message: "Không được cấp quyền để thực hiện hành động này!",
        });
      }
    });
  } catch (error: any) {
    return res.json({ error: error.message });
  }
};

export const veriyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  await verifyAccessToken(req, res, async () => {
    const user = (req as any).user;
    if (user.role == 0) {
      return res
        .status(403)
        .json({ error: "Không được cấp quyền để thực hiện hành động này!" });
    }
    return next();
  });
};

export const verifyCanCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return verifyPermission(req, res, next, coursePermission);
};

export const verifyCanStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return verifyPermission(req, res, next, studentPermission);
};

export const verifySupadmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = (req as any).user;
      if (user.role !== 2) {
        return res.status(401).json({
          error: "Bạn không được cấp phép để thực hiện hành động này",
        });
      }
      next();
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};
