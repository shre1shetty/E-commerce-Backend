import { Router } from "express";
import { LoginUser } from "../controller/Login.controller.js";

const router = Router();

router.post("/LoginUser", LoginUser);

export const LoginRoutes = router;
