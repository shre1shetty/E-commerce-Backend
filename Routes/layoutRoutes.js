import { Router } from "express";
import { upload } from "../multer.js";
import {
  addLayout,
  getActiveLayout,
  getFooter,
  getLogo,
} from "../controller/Layout.controller.js";

const router = new Router();
router.post("/addLayout", upload.any(), addLayout);
router.get("/getLayout", getActiveLayout);
router.get("/getLogo", getLogo);
router.get("/getFooter", getFooter);
export const LayoutRoutes = router;
