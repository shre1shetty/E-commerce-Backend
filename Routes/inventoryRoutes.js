import { Router } from "express";
import {
  addInventory,
  deleteProduct,
  getInventory,
  updateInventory,
} from "../controller/Inventory.controller.js";

const router = Router();

router.get("/getInventory", getInventory);
router.post("/addItem", addInventory);
router.post("/updateItem", updateInventory);
router.post("/deleteItem", deleteProduct);

export const InventoryRoute = router;
