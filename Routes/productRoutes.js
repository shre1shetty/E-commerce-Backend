import { Router } from "express";
import { addProduct } from "../controller/Product.controller.js";
import { upload } from "../multer.js";

const router = Router();
router.post("/addProduct", upload.any(), addProduct);

export const ProductRoutes = router;
