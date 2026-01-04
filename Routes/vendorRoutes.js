import { Router } from "express";
import { createVendor } from "../controller/Vendor.controller.js";

const router = Router();
router.post("/createVendor", createVendor);

export const vendorRoutes = router;
