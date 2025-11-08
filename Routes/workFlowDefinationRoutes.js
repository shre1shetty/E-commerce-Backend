import { Router } from "express";
import {
  addWorflowStage,
  deleteWorkFlowStage,
  getNextStage,
  getWorkFlowHistory,
  getWorkFlowStages,
  proceedToNextStage,
  updateWorkFlowStage,
} from "../controller/WorkFlowDefination.controller.js";

const router = new Router();
router.post("/addWorkFlowStage", addWorflowStage);
router.get("/getWorkFlowStages", getWorkFlowStages);
router.post("/updateWorkFlowStage", updateWorkFlowStage);
router.post("/deleteWorkFlowStage", deleteWorkFlowStage);
router.get("/getWorkFlowHistory", getWorkFlowHistory);
router.get("/getNextStage", getNextStage);
router.post("/proceedToNextStage", proceedToNextStage);
export const workFlowDefinationRoutes = router;
