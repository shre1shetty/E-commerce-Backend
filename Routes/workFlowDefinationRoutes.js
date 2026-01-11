import { Router } from "express";
import {
  addWorflowStage,
  cancelOrder,
  deleteWorkFlowStage,
  getNextStage,
  getWorkFlowHistory,
  getWorkFlowStages,
  proceedToNextStage,
  updateWorkFlowStage,
} from "../controller/WorkFlowDefination.controller.js";
import { requireRole, verifyToken } from "../Middleware/auth.js";

const router = new Router();

router.post("/cancelOrder", cancelOrder);
router.use(verifyToken, requireRole("admin"));
router.post("/addWorkFlowStage", addWorflowStage);
router.get("/getWorkFlowStages", getWorkFlowStages);
router.post("/updateWorkFlowStage", updateWorkFlowStage);
router.post("/deleteWorkFlowStage", deleteWorkFlowStage);
router.get("/getWorkFlowHistory", getWorkFlowHistory);
router.get("/getNextStage", getNextStage);
router.post("/proceedToNextStage", proceedToNextStage);
export const workFlowDefinationRoutes = router;
