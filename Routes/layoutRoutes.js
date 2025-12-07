import { Router } from "express";
import { upload } from "../multer.js";
import {
  addLayout,
  editLayout,
  getActiveLayout,
  getFooter,
  getLayouts,
  getLogo,
  toggleLayoutActiveStatus,
  updateLayout,
} from "../controller/Layout.controller.js";
import { requireRole, verifyToken } from "../Middleware/auth.js";

const router = new Router();
router.get("/getLayout", getActiveLayout);
router.get("/getLogo", getLogo);
router.get("/getFooter", getFooter);
router.post(
  "/toggleLayoutActiveStatus",
  verifyToken,
  requireRole("admin"),
  toggleLayoutActiveStatus
);
router.use(verifyToken, requireRole("admin"));
router.get("/getLayouts", getLayouts);
router.get("/editLayout", editLayout);
router.post("/addLayout", upload.any(), addLayout);
router.post("/updateLayout", upload.any(), updateLayout);
export const LayoutRoutes = router;
