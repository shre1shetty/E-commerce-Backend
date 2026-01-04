import multer from "multer";
import dotenv from "dotenv";

dotenv.config();
export const upload = multer({
  storage: multer.memoryStorage(),
});

export const tempUpload = multer({
  storage: multer.memoryStorage(),
});
