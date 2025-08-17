import { Router } from "express";
import {
  addWorflowStage,
  deleteWorkFlowStage,
  getWorkFlowStages,
  updateWorkFlowStage,
} from "../controller/WorkFlowDefination.controller.js";

const router = new Router();
router.post("/addWorkFlowStage", addWorflowStage);
router.get("/getWorkFlowStages", getWorkFlowStages);
router.post("/updateWorkFlowStage", updateWorkFlowStage);
router.post("/deleteWorkFlowStage", deleteWorkFlowStage);
export const workFlowDefinationRoutes = router;
