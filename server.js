import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { InventoryRoute } from "./Routes/inventoryRoutes.js";
import { FilterRoute } from "./Routes/filterRoutes.js";
import { VariantRoutes } from "./Routes/variantsRoutes.js";
const app = express();
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],

  allowedHeaders: ["Content-Type"],
};
app.use(express.json());
app.use(cors(corsOpts));
// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/E-Commerce")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/Inventory", InventoryRoute);
app.use("/Filters", FilterRoute);
app.use("/Variants", VariantRoutes);
