import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

// Configure GridFS Storage
export const storage = new GridFsStorage({
  url: "mongodb://127.0.0.1:27017/E-Commerce",
  file: (req, file) => {
    return {
      bucketName: "uploads", // The GridFS bucket name
      filename: `${file.originalname}`, // Unique filename
    };
  },
});
export const upload = multer({ storage });
