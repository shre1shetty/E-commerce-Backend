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
import { requireRole, verifyToken } from "../Middleware/auth.js";

const router = Router();
router.get("/getProductByCategory", getProductByCategory);
router.get("/getProductBySearch", getSearchProduct);
router.post("/search", getProductByFilters);
router.post("/getProductById", getProductById);
router.use(verifyToken, requireRole("admin"));
router.post("/addProduct", upload.any(), addProduct);
router.post("/updateProduct", upload.any(), updateProduct);
router.post("/getProducts", getProduct);
export const ProductRoutes = router;
