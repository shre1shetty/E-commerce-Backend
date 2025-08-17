import { Router } from "express";
import { getAdminOrders } from "../controller/Order.controller.js";

const router = new Router();

router.get("/getAdminOrders", getAdminOrders);
export const orderRoutes = router;
