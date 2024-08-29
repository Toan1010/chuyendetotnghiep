import cloudinary from "./cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import multer from "multer";

const imageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    public_id: (req, file) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      return `images/${name}`;
    },
  },
});

export const imageUpload = multer({
  storage: imageStorage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype == "image/bmp" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/gif"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ được sử dụng hình ảnh cho tính năng này"));
    }
  },
});
