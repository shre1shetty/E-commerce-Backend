import { Router } from "express";
import {
  addInventory,
  deleteProduct,
  getInventory,
  updateInventory,
  uploadToInventory,
} from "../controller/Inventory.controller.js";
import { tempUpload } from "../multer.js";

const router = Router();

router.get("/getInventory", getInventory);
router.post("/addItem", addInventory);
router.post("/updateItem", updateInventory);
router.post("/deleteItem", deleteProduct);
router.post("/uploadInventory", tempUpload.single("file"), uploadToInventory);

export const InventoryRoute = router;
