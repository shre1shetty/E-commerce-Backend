import { Router } from "express";
import {
  addRating,
  getRatingsByProductId,
} from "../controller/Rating.controller.js";
import { upload } from "../multer.js";

const router = new Router();
router.post("/addRating", upload.any(), addRating);
router.get("/getRatingsByproductId", getRatingsByProductId);
export const ratingRoutes = router;
