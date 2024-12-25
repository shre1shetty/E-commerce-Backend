import { Router } from "express";
import {
  addVariant,
  addVariantField,
  deleteVariant,
  deleteVariantField,
  getVariant,
  getVariantField,
  updateVariant,
  updateVariantField,
} from "../controller/Variant.controller.js";

const router = Router();

router.get("/getVariant", getVariant);
router.get("/getVariantField", getVariantField);
router.post("/addVariant", addVariant);
router.post("/addVariantField", addVariantField);
router.post("/updateVariant", updateVariant);
router.post("/updateVariantField", updateVariantField);
router.post("/deleteVariant", deleteVariant);
router.post("/deleteVariantField", deleteVariantField);

export const VariantRoutes = router;
