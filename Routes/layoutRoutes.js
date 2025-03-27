import { Router } from "express";
import { upload } from "../multer.js";
import { addLayout } from "../controller/Layout.controller.js";

const router = new Router();
router.post("/addLayout", upload.any(), addLayout);
export const LayoutRoutes = router;
