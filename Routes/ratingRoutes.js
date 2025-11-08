import { Router } from "express";
import {
  addRating,
  getRatingsByProductId,
  getRecentRatings,
} from "../controller/Rating.controller.js";
import { upload } from "../multer.js";

const router = new Router();
router.post("/addRating", upload.any(), addRating);
router.get("/getRatingsByproductId", getRatingsByProductId);
router.get("/getRecentRatings", getRecentRatings);
export const ratingRoutes = router;
