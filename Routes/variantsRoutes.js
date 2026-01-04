import { Router } from "express";
import {
  addVariant,
  addVariantField,
  deleteVariant,
  deleteVariantField,
  getGSTFilter,
  getVariant,
  getVariantField,
  updateVariant,
  updateVariantField,
} from "../controller/Variant.controller.js";
import { requireRole, verifyToken } from "../Middleware/auth.js";

const router = Router();

router.post("/getGSTFilter", getGSTFilter);
router.use(verifyToken, requireRole("admin"));
router.get("/getVariant", getVariant);
router.get("/getVariantField", getVariantField);
router.post("/addVariant", addVariant);
router.post("/addVariantField", addVariantField);
router.post("/updateVariant", updateVariant);
router.post("/updateVariantField", updateVariantField);
router.post("/deleteVariant", deleteVariant);
router.post("/deleteVariantField", deleteVariantField);

export const VariantRoutes = router;
