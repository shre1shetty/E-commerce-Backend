import { Router } from "express";
import {
  addUser,
  LoginUser,
  logout,
  refresh,
} from "../controller/User.controller.js";

const router = Router();
router.post("/addUser", addUser);
router.post("/LoginUser", LoginUser);
router.post("/refreshToken", refresh);
router.post("/logout", logout);
export const UserRoutes = router;
