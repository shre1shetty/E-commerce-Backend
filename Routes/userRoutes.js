import { Router } from "express";
import {
  addUser,
  forgotPassword,
  getuserDetails,
  LoginUser,
  logout,
  refresh,
  resetPassword,
  updateDetails,
  updatePassword,
  validateOTP,
} from "../controller/User.controller.js";

const router = Router();
router.post("/addUser", addUser);
router.post("/LoginUser", LoginUser);
router.post("/refreshToken", refresh);
router.post("/logout", logout);
router.get("/getUserDetails", getuserDetails);
router.post("/updateUserDetails", updateDetails);
router.post("/updatePassword", updatePassword);
router.post("/forgotPassword", forgotPassword);
router.post("/validateOTP", validateOTP);
router.post("/resetPassword", resetPassword);
export const UserRoutes = router;
