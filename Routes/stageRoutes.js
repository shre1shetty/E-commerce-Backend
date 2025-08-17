import { Router } from "express";
import {
  addStage,
  getStages,
  getStagesForDrpDown,
  updateStage,
} from "../controller/Stage.controller.js";

const router = new Router();
router.post("/addStage", addStage);
router.get("/getStages", getStages);
router.get("/getStagesForDrpDown", getStagesForDrpDown);
router.post("/updateStage", updateStage);
export const stageRoutes = router;
