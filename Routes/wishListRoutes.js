import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  getWishlistProductsByUserId,
  removeFromWishList,
} from "../controller/Wishlist.controller.js";

const router = Router();
router.post("/addToWishlist", addToWishlist);
router.post("/getWishlistByUser", getWishlist);
router.post("/removeFromWishList", removeFromWishList);
router.post("/getWishlistProductsByUserId", getWishlistProductsByUserId);
export const wishlistRoutes = router;
