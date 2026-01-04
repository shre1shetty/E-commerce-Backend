import { Router } from "express";
import {
  addUser,
  getuserDetails,
  LoginUser,
  logout,
  refresh,
  updateDetails,
  updatePassword,
} from "../controller/User.controller.js";

const router = Router();
router.post("/addUser", addUser);
router.post("/LoginUser", LoginUser);
router.post("/refreshToken", refresh);
router.post("/logout", logout);
router.get("/getUserDetails", getuserDetails);
router.post("/updateUserDetails", updateDetails);
router.post("/updatePassword", updatePassword);
export const UserRoutes = router;
