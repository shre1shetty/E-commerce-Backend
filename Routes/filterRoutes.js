import { Router } from "express";
import {
  addFilter,
  addFilterType,
  deleteFilter,
  deleteFilterType,
  getFilter,
  getFilterType,
  getFilterWithSubFilter,
  updateFilter,
  updateFilterType,
} from "../controller/Filter.controller.js";
import { upload } from "../multer.js";
import { verifyToken, requireRole } from "../Middleware/auth.js";
const router = Router();

router.get("/getFilterWithSubFilter", getFilterWithSubFilter);
router.use(verifyToken, requireRole("admin"));
router.get("/getFilter", getFilter);
router.get("/getFilterType", getFilterType);
router.post("/addFilter", addFilter);
router.post("/addFilterType", addFilterType);
router.post("/updateFilter", updateFilter);
router.post("/updateFilterType", upload.any(), updateFilterType);
router.post("/deleteFilter", deleteFilter);
router.post("/deleteFilterType", deleteFilterType);

export const FilterRoute = router;
