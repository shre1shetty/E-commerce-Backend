import { Router } from "express";
import {
  addAddress,
  getAllAddressesById,
  updateAddress,
} from "../controller/Address.controller.js";

const router = new Router();
router.get("/getAddresses", getAllAddressesById);
router.post("/addAddress", addAddress);
router.post("/updateAddress", updateAddress);
export const addressRoutes = router;
