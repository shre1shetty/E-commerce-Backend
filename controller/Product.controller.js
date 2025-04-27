import mongoose from "mongoose";
import { Products } from "../Models/ProductToDisplay.js";
import { deleteFile, getFileContentById } from "../server.js";

export const getProduct = async (req, res) => {
  try {
    let products = await Products.find()
      .select(
        "-__v -createdAt -updatedAt -variantValues -pictures -Title -productType"
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
    let products = await Products.find({ _id: req.query.id })
      .select("-__v -createdAt -updatedAt")
      .lean();
    for (const product of products) {
      // Update pictures array
      product.pictures = await Promise.all(
        product.pictures.map(async (picture) => {
          return await getFileContentById(new mongoose.Types.ObjectId(picture));
        })
      );

      for (const variant of product.variantValues) {
        if (variant.values.picture) {
          variant.values.picture = await getFileContentById(
            new mongoose.Types.ObjectId(variant.values.picture)
          );
        }
      }
    }

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
    body.variantValues.forEach((variant, index) => {
      const pictureKey = `variantValues[${index}][values][picture]`;
      const uploadedPicture = req.files.find(
        (file) => file.fieldname === pictureKey
      );
      if (uploadedPicture) {
        // Assign the file ID (from GridFS) to the variant's picture
        variant.values.picture = uploadedPicture.id.toString(); // Save the file ID
      }
    });
    body.pictures = [];
    const uploadedPicture = req.files.filter((file) =>
      file.fieldname.includes(`pictures[`)
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
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    Products.find({ _id: req.query.id }).then((resp) => {
      resp[0].pictures.forEach((picture) => {
        deleteFile(picture);
      });
      resp[0].variantValues.forEach((variant) => {
        if (variant.values.picture) {
          deleteFile(variant.values.picture);
        }
      });
    });

    const body = req.body;
    body.variantValues.forEach((variant, index) => {
      const pictureKey = `variantValues[${index}][values][picture]`;
      const uploadedPicture = req.files.find(
        (file) => file.fieldname === pictureKey
      );
      if (uploadedPicture) {
        // Assign the file ID (from GridFS) to the variant's picture
        variant.values.picture = uploadedPicture.id.toString(); // Save the file ID
      }
    });
    body.pictures = [];
    const uploadedPicture = req.files.filter((file) =>
      file.fieldname.includes(`pictures[`)
    );
    if (uploadedPicture) {
      uploadedPicture.forEach((file) => {
        body.pictures.push(file.id.toString());
      });
    }
    Products.findOneAndUpdate(
      { _id: req.query.id },
      { $set: body },
      { new: true } // Return the updated document
    )
      .then((resp) => {
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
    let products = await Products.find({ "category.value": req.query.id })
      .select("-createdAt -updatedAt -__v -variantValues")
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
      console.log(searchTerm);
      if (searchTerm.length === 0) {
        return []; // prevent infinite recursion
      }
      const productList = await Products.find({
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
        .select("-__v -createdAt -updatedAt");
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
