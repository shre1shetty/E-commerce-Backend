import { Router } from "express";
import {
  addRating,
  getRatingsByProductId,
  getRecentRatings,
} from "../controller/Rating.controller.js";
import { upload } from "../multer.js";
import { gridfsUploadMiddleware } from "../Middleware/gridfsUploadMiddleware.js";

const router = new Router();
router.post("/addRating", upload.any(), gridfsUploadMiddleware, addRating);
router.get("/getRatingsByproductId", getRatingsByProductId);
router.get("/getRecentRatings", getRecentRatings);
export const ratingRoutes = router;
