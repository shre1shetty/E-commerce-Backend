import { Router } from "express";
import {
  addFilter,
  addFilterType,
  deleteFilter,
  deleteFilterType,
  getFilter,
  getFilterType,
  getFilterWithSubFilter,
  getOptionsForSearch,
  toggleShowOnSearch,
  updateFilter,
  updateFilterType,
} from "../controller/Filter.controller.js";
import { upload } from "../multer.js";
import { verifyToken, requireRole } from "../Middleware/auth.js";
import { gridfsUploadMiddleware } from "../Middleware/gridfsUploadMiddleware.js";
const router = Router();

router.get("/getFilterWithSubFilter", getFilterWithSubFilter);
router.get("/getOptionsForSearch", getOptionsForSearch);
router.use(verifyToken, requireRole("admin"));
router.get("/getFilter", getFilter);
router.get("/getFilterType", getFilterType);
router.post("/addFilter", addFilter);
router.post(
  "/addFilterType",
  upload.any(),
  gridfsUploadMiddleware,
  addFilterType
);
router.post("/updateFilter", updateFilter);
router.post(
  "/updateFilterType",
  upload.any(),
  gridfsUploadMiddleware,
  updateFilterType
);
router.post("/deleteFilter", deleteFilter);
router.post("/deleteFilterType", deleteFilterType);
router.post("/toggleShowOnSearch", toggleShowOnSearch);

export const FilterRoute = router;
