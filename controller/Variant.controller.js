import mongoose from "mongoose";
import { Variants } from "../Models/Variant.js";

export const getVariant = async (req, res) => {
  try {
    const VariantItems = await Variants.aggregate([
      {
        $match: { vendorId: req.vendor },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          gstSlabs: 1,
          Fields: "$fields",
          variantCount: { $size: { $ifNull: ["$fields", []] } },
        },
      },
    ]);
    res.json(VariantItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addVariant = async (req, res) => {
  req.body.vendorId = req.vendor;
  const newItem = new Variants(req.body);
  try {
    await newItem.save();
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const updateVariant = async (req, res) => {
  req.body.vendorId = req.vendor;
  try {
    Variants.findOneAndUpdate(
      {
        _id: req.query.id,
        vendorId: req.vendor,
      },
      req.body,
    )
      .then(() => {
        res.json({
          statusMsg: "Record Updated Successfully",
          statusCode: 200,
        });
      })
      .catch((error) =>
        res.json({
          statusMsg: "Cannot find the Filter" + error.message,
          statusCode: 404,
        }),
      );
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const deleteVariant = async (req, res) => {
  try {
    Variants.deleteOne({
      _id: req.query.id,
      vendorId: req.vendor,
    }).then((resp) => {
      res.json({
        statusMsg:
          resp.deletedCount > 0
            ? "Record Deleted Successfully"
            : "Cannot find the Filter",
        statusCode: resp.deletedCount > 0 ? 200 : 404,
      });
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getVariantField = async (req, res) => {
  try {
    let VariantFields;
    if (req.query.id) {
      VariantFields = await Variants.find({
        _id: req.query.id,
        vendorId: req.vendor,
      }).select({
        fields: 1,
      });
      VariantFields = VariantFields.flatMap((data) => data.fields);
    } else {
      VariantFields = await Variants.find({ vendorId: req.vendor }).select({
        fields: 1,
      });
      VariantFields = VariantFields.flatMap((data) => data.fields);
    }

    res.json(VariantFields);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addVariantField = async (req, res) => {
  try {
    await Variants.findOneAndUpdate(
      {
        _id: req.query.id,
        vendorId: req.vendor,
      },
      {
        $push: { fields: req.body },
      },
    );
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const updateVariantField = async (req, res) => {
  // const newItem = new Variants(req.body);
  const { name, id, _id, flag } = req.body;
  try {
    Variants.findOneAndUpdate(
      { _id: id, "fields._id": _id, vendorId: req.vendor },
      { $set: { "fields.$.name": name, "fields.$.flag": flag } },
    )
      .then((resp) => {
        res.json({
          statusMsg: "Record Updated Successfully",
          statusCode: 200,
        });
      })
      .catch((error) => {
        console.log(error);
        res.json({
          statusMsg: "Cannot find the Filter",
          statusCode: 404,
        });
      });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const deleteVariantField = async (req, res) => {
  try {
    const { id, itemId } = req.body;
    Variants.findOneAndUpdate(
      { _id: id, vendorId: req.vendor },
      { $pull: { fields: { _id: itemId } } },
    ).then((resp) => {
      res.json({
        statusMsg: "Record Deleted Successfully",
        statusCode: 200,
      });
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getGSTFilter = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        statusCode: 400,
        statusMsg: "Invalid or missing 'ids' in request body",
      });
    }
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const filtersData = await Variants.aggregate([
      {
        $match: { vendorId: req.vendor },
      },
      {
        $match: {
          _id: { $in: objectIds },
        },
      },
    ]);
    res.status(200).json(filtersData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};
