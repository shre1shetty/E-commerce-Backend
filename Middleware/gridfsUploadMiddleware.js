import mongoose from "mongoose";

const uploadToGridFS = (req, file) => {
  const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "uploads",
  });

  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(file.originalname, {
      contentType: file.mimetype,
      metadata: {
        vendorId: req.vendor,
      },
    });

    stream.on("finish", () =>
      resolve({
        id: stream.id,
        filename: file.originalname,
        bucketName: "uploads",
        contentType: file.mimetype,
      })
    );

    stream.on("error", reject);
    stream.end(file.buffer);
  });
};

export const gridfsUploadMiddleware = async (req, res, next) => {
  try {
    if (req.file) {
      Object.assign(req.file, await uploadToGridFS(req, req.file));
    }

    if (Array.isArray(req.files)) {
      req.files = await Promise.all(
        req.files.map(async (f) => ({
          ...f,
          ...(await uploadToGridFS(req, f)),
        }))
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
