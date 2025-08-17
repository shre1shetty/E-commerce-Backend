import { Router } from "express";
import { addUser, LoginUser } from "../controller/User.controller.js";

const router = Router();
router.post("/addUser", addUser);
router.post("/LoginUser", LoginUser);

export const UserRoutes = router;
