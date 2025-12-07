import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import dotenv from "dotenv";

dotenv.config();
// Configure GridFS Storage
export const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    return {
      bucketName: "uploads", // The GridFS bucket name
      filename: `${file.originalname}`, // Unique filename
    };
  },
});
export const upload = multer({ storage });
