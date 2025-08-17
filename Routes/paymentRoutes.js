import { Router } from "express";
import {
  confirmOrder,
  createOrder,
  verifyOrder,
} from "../controller/Payment.controller.js";

const router = Router();
router.post("/createOrder", createOrder);
router.post("/verifyOrder", verifyOrder);
router.post("/confirmOrder", confirmOrder);
export const PaymentRoutes = router;
