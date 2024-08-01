import { NextFunction, Request, Response } from "express";
import { tokenVerify } from "../helpers/tokenHandle";

export const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Access token required" });
    }
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({ message: "Access token required" });
    }
    const user = await tokenVerify(accessToken, "access");
    if (!user) {
      return res.status(403).json({ message: "Invalid access token" });
    }
    req.body.user = user; 
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = req.body.user;
      if (user && user.role === "student") {
        return next();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifySuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = req.body.user;
      if (user && user.role === "super_admin") {
        return next();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyStudentAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = req.body.user;
      if (
        user &&
        (user.role === "super_admin" || user.role === "student_admin")
      ) {
        return next();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyCourseAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await verifyAccessToken(req, res, async () => {
      const user = req.body.user;
      if (
        user &&
        (user.role === "super_admin" || user.role === "course_admin")
      ) {
        return next();
      } else {
        return res.status(403).json({ message: "Unauthorized" });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
