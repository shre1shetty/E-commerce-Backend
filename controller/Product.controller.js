import { Products } from "../Models/ProductToDisplay.js";
import { deleteFile } from "../server.js";

export const getProduct = async (req, res) => {
  try {
    let products = await Products.find({ vendorId: req.vendor })
      .select(
        "-__v -createdAt -updatedAt -variantValues -pictures -vendorId -Title -productType",
      )
      .lean();
    products = products.map((product) => {
      return {
        ...product,
        variantFields: `${
          product.variantFields[0].field
        }:${product.variantFields[0].value.toString()} ${
          product.variantFields[1].field
        }:${product.variantFields[1].value.toString()}`,
        category: product.category.map((val) => val.label).toString(),
      };
    });

    // const { userId } = req.body;

    // let pipeline = [
    //   {
    //     $project: {
    //       __v: 0,
    //       createdAt: 0,
    //       updatedAt: 0,
    //       variantValues: 0,
    //       pictures: 0,
    //       Title: 0,
    //       productType: 0,
    //       category: {
    //         $reduce: {
    //           input: "$category.label",
    //           initialValue: "",
    //           in: {
    //             $cond: [
    //               { eq: ["$$this", ""] },
    //               "$$this",
    //               { $concat: ["$$value", ",", "$$this"] },
    //             ],
    //           },
    //         },
    //       },
    //       products: {
    //         $concat: [
    //           {
    //             $arrayElemAt: ["$variantFields.field", 0],
    //           },
    //           ":",
    //           {
    //             $toString: {
    //               $arrayElemAt: ["$variantFields.value", 0],
    //             },
    //           },
    //           " ",
    //           {
    //             $arrayElemAt: ["$variantFields.field", 1],
    //           },
    //           ":",
    //           {
    //             $toString: {
    //               $arrayElemAt: ["$variantFields.value", 1],
    //             },
    //           },
    //         ],
    //       },
    //     },
    //   },
    // ];

    // if (userId) {
    //   pipeline.push(
    //     {
    //       $lookup: {
    //         from: "wishlists",
    //         let: { prodId: "$_id" },
    //         pipeline: [
    //           {
    //             $matchup: {
    //               $expr: {
    //                 $and: [
    //                   { $eq: ["$productId", "$$prodId"] },
    //                   { $eq: ["$userId", new mongoose.Types.ObjectId(userId)] },
    //                 ],
    //               },
    //             },
    //           },
    //         ],
    //         as: "wishlist",
    //       },
    //     },
    //     {
    //       $addFields: {
    //         isWishListed: { $gt: [{ $size: "$wishlist" }, 0] },
    //       },
    //     },
    //     {
    //       $project: {
    //         wishlist: 0,
    //       },
    //     }
    //   );
    // }

    // const products = await Products.aggregate(pipeline);

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    let products = await Products.find({
      _id: req.query.id,
      vendorId: req.vendor,
    })
      .select("-__v -createdAt -updatedAt -vendorId")
      .lean();

    res.json(products[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addProduct = async (req, res) => {
  try {
    const body = req.body;
    body.vendorId = req.vendor;
    body.variantValues.forEach((variant, index) => {
      variant.values.picture = [];
      const pictureKey = `variantValues[${index}][values][picture]`;
      const uploadedPicture = req.files.filter((file) =>
        file.fieldname.includes(pictureKey),
      );
      // console.log(uploadedPicture);
      if (uploadedPicture && uploadedPicture.length > 0) {
        uploadedPicture.forEach((file) => {
          variant.values.picture.push(file.id.toString());
        });
        // Assign the file ID (from GridFS) to the variant's picture
      }
    });
    body.pictures = [];
    const uploadedPicture = req.files.filter((file) =>
      file.fieldname.includes(`pictures[`),
    );
    if (uploadedPicture) {
      uploadedPicture.forEach((file) => {
        body.pictures.push(file.id.toString());
      });
    }

    const product = new Products(body);
    await product.save();
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    console.log(error);
    if (req.files?.length) {
      try {
        await Promise.all(
          req.files
            .filter((file) => file.id)
            .map((file) => deleteFile(file.id, req.vendor)),
        );
      } catch (cleanupError) {
        console.error("File cleanup failed:", cleanupError);
      }
    }
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const oldProduct = await Products.findOne({
      _id: req.query.id,
      vendorId: req.vendor,
    });

    const body = req.body;
    body.vendorId = req.vendor;
    body.variantValues.forEach((variant, index) => {
      variant.values.picture = [];
      const pictureKey = `variantValues[${index}][values][picture]`;
      const uploadedPicture = req.files.filter((file) =>
        file.fieldname.includes(pictureKey),
      );
      // console.log(uploadedPicture);
      if (uploadedPicture && uploadedPicture.length > 0) {
        uploadedPicture.forEach((file) => {
          variant.values.picture.push(file.id.toString());
        });
        // Assign the file ID (from GridFS) to the variant's picture
      }
    });
    body.pictures = [];
    const uploadedPicture = req.files.filter((file) =>
      file.fieldname.includes(`pictures[`),
    );
    if (uploadedPicture) {
      uploadedPicture.forEach((file) => {
        body.pictures.push(file.id.toString());
      });
    }
    Products.findOneAndUpdate(
      { _id: req.query.id, vendorId: req.vendor },
      { $set: body },
      { new: true }, // Return the updated document
    )
      .then((resp) => {
        oldProduct.variantValues.forEach((variant) => {
          if (variant.values.picture && variant.values.picture.length > 0) {
            variant.values.picture.forEach((pictureId) =>
              deleteFile(pictureId, req.vendor),
            );
          }
        });
        res.json({ statusMsg: "Record Updated Succesfully", statusCode: 200 });
      })
      .catch((error) => {
        console.log(error);
        res.status(500).json({
          statusCode: 500,
          statusMsg: "Server Error",
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getProductByCategory = async (req, res) => {
  try {
    const ids = req.query.id.split(",");
    let products = await Products.find({
      $and: [
        ...ids.map((id) => ({
          category: {
            $elemMatch: { value: id },
          },
        })),
        { vendorId: req.vendor },
      ],
    })
      .select("-createdAt -updatedAt -__v -vendorId")
      .lean();
    if (products.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "No Product Found",
      });
    }
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getSearchProduct = async (req, res) => {
  try {
    async function getProductsBySearch(searchTerm) {
      if (searchTerm.length === 0) {
        return []; // prevent infinite recursion
      }
      const productList = await Products.find({
        vendorId: req.vendor,
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { fabric: { $regex: searchTerm, $options: "i" } },
          { brand: { $regex: searchTerm, $options: "i" } },
          { fitType: { $regex: searchTerm, $options: "i" } },
          { "category.label": { $regex: searchTerm, $options: "i" } },
          { "variantFields.value": { $regex: searchTerm, $options: "i" } },
        ],
      })
        .limit(50)
        .select("-__v -createdAt -updatedAt -vendorId");
      if (productList.length == 0 && searchTerm.length > 1) {
        return await getProductsBySearch(searchTerm.slice(0, -1));
      }

      return productList;
    }
    let products = await getProductsBySearch(req.query.searchTerm || "");
    if (products.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "No Product Found",
      });
    }
    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getProductByFilters = async (req, res) => {
  try {
    const { fabric, brand, fitType, category, variantFields, tags } = req.body;
    // Dynamically construct the $or array
    const filters = [];
    if (fabric) filters.push({ fabric: { $regex: fabric, $options: "i" } });
    if (brand) filters.push({ brand: { $regex: brand, $options: "i" } });
    if (fitType) filters.push({ fitType: { $regex: fitType, $options: "i" } });
    if (category)
      filters.push({ "category.label": { $regex: category, $options: "i" } });
    if (variantFields)
      filters.push({
        "variantFields.value": { $regex: variantFields, $options: "i" },
      });
    if (tags)
      filters.push({
        tags: {
          $in: tags.split(",").map((term) => new RegExp(`^${term}$`, "i")),
        },
      });
    // If no filters are provided, return an empty array or a 400 error
    if (filters.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        statusMsg: "No filters provided",
      });
    }
    // Query the database with the constructed filters
    const products = await Products.find({
      vendorId: req.vendor,
      $or: filters,
    }).select("-__v -createdAt -updatedAt -vendorId");

    if (products.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "No Product Found",
      });
    }

    res.json(products);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
