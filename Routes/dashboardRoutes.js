import { Router } from "express";
import {
  getMonthlySales,
  getOverAllData,
  getTopSellingProducts,
  salesByCategory,
} from "../controller/Dashboard.controller.js";

const router = Router();

router.get("/getMonthlyOrders", getMonthlySales);
router.get("/getTopProducts", getTopSellingProducts);
router.get("/getOverAllData", getOverAllData);
router.get("/salesByCategory", salesByCategory);

export const dashboardRoutes = router;
