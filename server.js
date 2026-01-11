import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { InventoryRoute } from "./Routes/inventoryRoutes.js";
import { FilterRoute } from "./Routes/filterRoutes.js";
import { VariantRoutes } from "./Routes/variantsRoutes.js";
import { ProductRoutes } from "./Routes/productRoutes.js";
import { LoginRoutes } from "./Routes/loginRoutes.js";
import { LayoutRoutes } from "./Routes/layoutRoutes.js";
import dotenv from "dotenv";
import { UserRoutes } from "./Routes/userRoutes.js";
import { ratingRoutes } from "./Routes/ratingRoutes.js";
import { CartRoutes } from "./Routes/cartRoutes.js";
import { PaymentRoutes } from "./Routes/paymentRoutes.js";
import { stageRoutes } from "./Routes/stageRoutes.js";
import { workFlowDefinationRoutes } from "./Routes/workFlowDefinationRoutes.js";
import { orderRoutes } from "./Routes/orderRoutes.js";
import { dashboardRoutes } from "./Routes/dashboardRoutes.js";
import { addressRoutes } from "./Routes/addressRoutes.js";
import { requireRole, verifyToken } from "./Middleware/auth.js";
import cookieParser from "cookie-parser";
import { themeRoutes } from "./Routes/themeRoute.js";
import { wishlistRoutes } from "./Routes/wishListRoutes.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import "./event/handlers/RejectHandler.js";
import { vendorRoutes } from "./Routes/vendorRoutes.js";
import { resolveVendorByDomain } from "./Middleware/vendorIdentification.js";
const app = express();
dotenv.config();
const corsOpts = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
  exposedHeaders: "Content-Disposition",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // This is the key setting
};
app.set("trust proxy", 1);
app.use(helmet());
app.use(express.json());
app.use(cors(corsOpts));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

let gfs;

// MongoDB Connection
console.log(process.env.MONGO_URI);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    const conn = mongoose.connection;
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
      bucketName: "uploads",
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use(resolveVendorByDomain);
app.use("/Inventory", verifyToken, requireRole("admin"), InventoryRoute);
app.use("/Filters", FilterRoute);
app.use("/Variants", VariantRoutes);
app.use("/Products", ProductRoutes);
app.use("/Layout", LayoutRoutes);
app.use("/Login", LoginRoutes);
app.use("/User", UserRoutes);
app.use("/Rating", ratingRoutes);
app.use("/Cart", CartRoutes);
app.use("/Payments", PaymentRoutes);
app.use("/Orders", orderRoutes);
app.use("/Stage", verifyToken, requireRole("admin"), stageRoutes);
app.use("/WorkFlowDefination", workFlowDefinationRoutes);
app.use("/Dashboard", verifyToken, requireRole("admin"), dashboardRoutes);
app.use("/Address", addressRoutes);
app.use("/Wishlist", wishlistRoutes);
app.use("/Theme", themeRoutes);
app.use("/Vendor", vendorRoutes);
app.get("/file", async (req, res) => {
  try {
    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
      return res.status(400).send("Invalid file ID");
    }

    const fileId = new mongoose.Types.ObjectId(req.query.id);
    // Find the file in GridFS
    gfs
      .find({ _id: fileId, "metadata.vendorId": req.vendor })
      .toArray()
      .then((files) => {
        if (!files || files.length === 0) {
          return res.status(404).send("File not found");
        }
        // Set the content type and stream the file
        res.set("Content-Type", files[0].contentType);
        res.set(
          "Content-Disposition",
          `attachment; filename=${files[0].filename}`
        );
        gfs
          .openDownloadStream(fileId)
          .on("error", (err) => {
            console.error("Stream error:", err);
            res.status(500).send("Error streaming file");
          })
          .pipe(res);
      })
      .catch((err) => {
        console.error("Error finding file:", err);
        res.status(500).send("Error retrieving file");
      });
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Error retrieving file");
  }
});
export const getFileContentById = (ID, vendorId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const fileId =
        typeof ID === "string" ? new mongoose.Types.ObjectId(ID) : ID;

      const files = await gfs
        .find({ _id: fileId, "metadata.vendorId": vendorId })
        .toArray();

      if (!files || files.length === 0) {
        return reject(new Error("File not found or unauthorized"));
      }

      const file = files[0];

      const readStream = gfs.openDownloadStream(fileId);
      const chunks = [];

      readStream.on("data", (chunk) => chunks.push(chunk));

      readStream.on("end", () => {
        const fileBuffer = Buffer.concat(chunks);

        resolve({
          filename: file.filename,
          contentType: file.contentType,
          uploadDate: file.uploadDate,
          metadata: file.metadata,
          base64: fileBuffer.toString("base64"),
        });
      });

      readStream.on("error", (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
};

export async function deleteFile(fileId, vendorId) {
  try {
    const files = await gfs
      .find({ _id: fileId, "metadata.vendorId": vendorId })
      .toArray();

    if (!files.length) throw new Error("Unauthorized");

    await gfs.delete(fileId);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}
