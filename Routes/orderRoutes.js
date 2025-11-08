import { Router } from "express";
import {
  getAdminOrders,
  getAdminOrdersById,
  getOrdersbyType,
} from "../controller/Order.controller.js";

const router = new Router();

router.get("/getAdminOrders", getAdminOrders);
router.post("/getAdminOrdersById", getAdminOrdersById);
router.post("/getOrdersByType", getOrdersbyType);
export const orderRoutes = router;
