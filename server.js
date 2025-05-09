import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { InventoryRoute } from "./Routes/inventoryRoutes.js";
import { FilterRoute } from "./Routes/filterRoutes.js";
import { VariantRoutes } from "./Routes/variantsRoutes.js";
import { ProductRoutes } from "./Routes/productRoutes.js";
import mongodb from "mongodb";
import { LoginRoutes } from "./Routes/loginRoutes.js";
import { LayoutRoutes } from "./Routes/layoutRoutes.js";
import dotenv from "dotenv";
const app = express();
dotenv.config();
const corsOpts = {
  origin: "*",

  methods: ["GET", "POST"],

  allowedHeaders: ["Content-Type"],
};
app.use(express.json());
app.use(cors(corsOpts));

let gfs;

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/E-Commerce")
  .then(() => {
    console.log("Connected to MongoDB");
    const conn = mongoose.connection;
    gfs = new mongodb.GridFSBucket(conn.db, {
      bucketName: "uploads", // Specify the bucket name (default is 'fs')
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

app.use("/Inventory", InventoryRoute);
app.use("/Filters", FilterRoute);
app.use("/Variants", VariantRoutes);
app.use("/Products", ProductRoutes);
app.use("/Layout", LayoutRoutes);
app.use("/Login", LoginRoutes);

app.get("/file", async (req, res) => {
  try {
    // Validate file ID
    if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
      return res.status(400).send("Invalid file ID");
    }

    const fileId = new mongoose.Types.ObjectId(req.query.id);
    // Find the file in GridFS
    gfs
      .find({ _id: fileId })
      .toArray()
      .then((files) => {
        if (!files || files.length === 0) {
          return res.status(404).send("File not found");
        }

        // Set the content type and stream the file
        res.set("Content-Type", files[0].contentType);
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
export const getFileContentById = (ID) => {
  return new Promise((resolve, reject) => {
    try {
      gfs
        .find({ _id: ID })
        .toArray()
        .then((files) => {
          delete files[0]?._id; // Remove the _id field from the file object
          delete files[0]?.chunkSize; // Remove the _id field from the file object
          delete files[0]?.length; // Remove the _id field from the file object
          const readStream = gfs.openDownloadStream(ID);
          let chunks = []; // Array to store file chunks

          readStream.on("data", (chunk) => {
            chunks.push(chunk); // Add each chunk to the array
          });

          readStream.on("end", () => {
            const fileBuffer = Buffer.concat(chunks); // Combine all chunks into a single buffer
            resolve({
              ...files[0],
              base64: fileBuffer.toString("base64"),
            }); // Resolve with the base64-encoded file content
          });

          readStream.on("error", (err) => {
            console.error("Stream error:", err);
            reject(err); // Reject the promise with the error
          });
        });
    } catch (err) {
      console.log(err);
      reject(err); // Reject the promise if there's an error
    }
  });
};

export async function deleteFile(fileId) {
  try {
    await gfs.delete(new mongoose.Types.ObjectId(fileId));
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

// app.get("/files", async (req, res) => {
//   try {
//     let files = await gfs.find().toArray();
//     const readStream = gfs.openDownloadStream(files[3]._id);
//     // readStream
//     //   .on("error", (err) => {
//     //     console.error(err);
//     //     res.status(404).send("File not found");
//     //   })
//     //   .pipe(res);

//     let chunks = []; // Array to store file chunks

//     // Capture chunks as they are read from the stream
//     readStream.on("data", (chunk) => {
//       chunks.push(chunk); // Add chunk to array
//     });

//     // When the stream ends, send the chunks as an object or array
//     readStream.on("end", () => {
//       // Combine the chunks into a single buffer or send them as an array of chunks
//       const fileBuffer = Buffer.concat(chunks);

//       // For example, return the combined buffer or chunks as a JSON response
//       res.json({
//         filename: files[3].filename,
//         fileSize: fileBuffer.length,
//         chunks: chunks.length,
//         data: fileBuffer.toString("base64"), // Example of sending the data as base64
//       });
//     });

//     // Handle any errors in the stream
//     readStream.on("error", (err) => {
//       console.error("Stream error:", err);
//       res.status(500).send("Error reading file");
//     });
//   } catch (err) {
//     console.log(err);
//     res.json({ err });
//   }
// });

// app.get("/file", async (req, res) => {
//   let files = await gfs.find().toArray();
//   const data = await getFileContentById(
//     new mongoose.Types.ObjectId("677a64b83ec69f2f48574505")
//   );
//   // console.log(data);
//   res.json(data);
// });
