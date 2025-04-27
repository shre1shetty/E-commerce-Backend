import { Router } from "express";
import { upload } from "../multer.js";
import {
  addLayout,
  editLayout,
  getActiveLayout,
  getFooter,
  getLayouts,
  getLogo,
  updateLayout,
} from "../controller/Layout.controller.js";

const router = new Router();
router.get("/getLayouts", getLayouts);
router.get("/editLayout", editLayout);
router.post("/addLayout", upload.any(), addLayout);
router.post("/updateLayout", upload.any(), updateLayout);
router.get("/getLayout", getActiveLayout);
router.get("/getLogo", getLogo);
router.get("/getFooter", getFooter);
export const LayoutRoutes = router;
