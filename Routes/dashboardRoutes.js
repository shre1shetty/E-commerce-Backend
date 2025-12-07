import { Router } from "express";
import {
  getMonthlySales,
  getOverAllData,
  getTopSellingProducts,
  salesByCategory,
} from "../controller/Dashboard.controller.js";
import { getAnalyticsData } from "../controller/Analytics.controller.js";

const router = Router();

router.get("/getMonthlyOrders", getMonthlySales);
router.get("/getTopProducts", getTopSellingProducts);
router.get("/getOverAllData", getOverAllData);
router.get("/salesByCategory", salesByCategory);
router.get("/analyticsOverview", getAnalyticsData);

export const dashboardRoutes = router;
