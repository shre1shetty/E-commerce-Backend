import { Router } from "express";
import {
  addProduct,
  getProduct,
  getProductById,
  updateProduct,
} from "../controller/Product.controller.js";
import { upload } from "../multer.js";

const router = Router();
router.post("/addProduct", upload.any(), addProduct);
router.post("/updateProduct", upload.any(), updateProduct);
router.post("/getProducts", getProduct);
router.post("/getProductById", getProductById);

export const ProductRoutes = router;
