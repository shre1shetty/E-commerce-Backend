import { Router } from "express";
import {
  AddtoCart,
  changeQuantity,
  GetCart,
  getCartCount,
} from "../controller/Cart.controller.js";

const router = Router();

router.post("/addToCart", AddtoCart);
router.get("/getCart", GetCart);
router.get("/getCartCount", getCartCount);
router.post("/changeQuantity", changeQuantity);

export const CartRoutes = router;
