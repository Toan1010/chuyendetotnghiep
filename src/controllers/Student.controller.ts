import { Request, Response } from "express";
import {
  addNewStudent,
  existingStudentByEmailorPhone,
  getListStudent,
  getStudentByID,
  updateStudent,
} from "../services/Student.service";
import { imageUpload } from "../configurations/multer";
import multer from "multer";

export const ListStudent = async (req: Request, res: Response) => {
  try {
    let { page = 1, limit = 10, name } = req.query;
    page = parseInt(page as string);
    limit = parseInt(limit as string);
    if (isNaN(page) || isNaN(limit)) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const offset = (page - 1) * limit;
    const result = await getListStudent(limit, offset, name as string);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const AddNewStudent = async (req: Request, res: Response) => {
  imageUpload.single("avatar")(req, res, async (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }

    const formData = req.body;
    const avatar = req.file?.path || "User_Icon.png"; // Lấy URL của ảnh từ Cloudinary

    try {
      const { name, email, phone } = formData;
      if (!name || !email || !phone) {
        return res.status(400).json({ message: "Thông tin không đầy đủ" });
      }
      const existingStudent = await existingStudentByEmailorPhone(email, phone);
      if (existingStudent) {
        return res
          .status(400)
          .json({ message: "Email hoặc số điện thoại đã tồn tại." });
      }
      const newStudent = await addNewStudent({
        student_name: name,
        student_email: email,
        phone: phone,
        hash_password:
          "$2a$12$eWIYY75oOkK1QRYuD2fBNercMBBNRY93dg4zUtB91z6OVpBIihAlu", // Lưu ý: Bạn nên mã hóa mật khẩu này
        avatar: avatar,
      });

      return res.status(201).json(newStudent);
    } catch (error: any) {
      console.log(error);

      return res.status(500).json({ message: "Sonthing ưrom" });
    }
  });
};

export const BulkAdd = async (req: Request, res: Response) => {
  return res.json("BulkAdd");
};

export const DetailStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    const student = await getStudentByID(id);
    if (!student) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }
    imageUpload.single("avatar")(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
    });

    const formData = req.body;
    const avatar = req.file?.path || "User_Icon.png"; // Lấy URL của ảnh từ Cloudinary

    return res.json({ student });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};

export const UpdateStudent = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const current = await getStudentByID(id);
    if (!current) {
      return res.status(404).json({ message: "Không tìm thấy sinh viên" });
    }

    imageUpload.single("avatar")(req, res, async (err: any) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      const formData = req.body;
      const avatar = req.file?.path || current.avatar;
      let { name, email, phone } = formData;
      if (email && phone) {
        const existingStudent = await existingStudentByEmailorPhone(
          email,
          phone,
          id
        );
        if (existingStudent) {
          return res
            .status(400)
            .json({ message: "Email hoặc số điện thoại đã tồn tại." });
        }
      }
      const updateData = {
        student_name: name || current.student_name,
        student_email: email || current.student_email,
        phone: phone || current.phone,
        avatar: avatar,
      };
      const updatedStudent = await updateStudent(id, updateData);

      return res.status(200).json({ update: updateData });
    });
  } catch (error) {
    return res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};
