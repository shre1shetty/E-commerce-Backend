import { Router } from "express";
import {
  addProduct,
  getProduct,
  getProductByCategory,
  getProductByFilters,
  getProductById,
  getSearchProduct,
  updateProduct,
} from "../controller/Product.controller.js";
import { upload } from "../multer.js";

const router = Router();
router.post("/addProduct", upload.any(), addProduct);
router.post("/updateProduct", upload.any(), updateProduct);
router.post("/getProducts", getProduct);
router.post("/getProductById", getProductById);
router.get("/getProductByCategory", getProductByCategory);
router.get("/getProductBySearch", getSearchProduct);
router.post("/search", getProductByFilters);
export const ProductRoutes = router;
