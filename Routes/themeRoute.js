import { Router } from "express";
import { getUserTheme } from "../controller/Theme.controller.js";

const router = Router();
router.get("/getUserTheme", getUserTheme);

export const themeRoutes = router;
