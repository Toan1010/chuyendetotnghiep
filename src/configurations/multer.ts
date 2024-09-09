import path from "path";
import multer from "multer";
const storage = multer.memoryStorage();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/avatars"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/files"));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/videos")); // Lưu file video trong thư mục videos
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Sử dụng tên file gốc
  },
});

export const avatarUpload = multer({
  storage: avatarStorage,
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

export const documentUpload = multer({
  storage: documentStorage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "application/msword" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Chỉ được phép upload file có định dạng .doc, .docx, .xls, .xlsx, hoặc .pdf"
        )
      );
    }
  },
});

export const videoUpload = multer({
  storage: videoStorage,
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "video/mp4" ||
      file.mimetype === "video/avi" ||
      file.mimetype === "video/mkv" ||
      file.mimetype === "video/mov" ||
      file.mimetype === "video/wmv"
    ) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Chỉ được phép upload file video có định dạng .mp4, .avi, .mkv, .mov, hoặc .wmv"
        )
      );
    }
  },
});

export const uploadExcell = multer({ storage: storage });
