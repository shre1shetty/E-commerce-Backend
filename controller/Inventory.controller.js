import { Inventory } from "../Models/Inventory.js";

import XLSX from "xlsx";

export const getInventory = async (req, res) => {
  try {
    const InventoryItems = await Inventory.find({ vendorId: req.vendor });
    res.json(InventoryItems);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addInventory = async (req, res) => {
  req.body.vendorId = req.vendor;
  const newItem = new Inventory(req.body);
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

export const updateInventory = async (req, res) => {
  req.body.vendorId = req.vendor;
  try {
    Inventory.findOneAndUpdate(
      {
        _id: req.query.id,
        vendorId: req.vendor,
      },
      req.body
    )
      .then((resp) => {
        Inventory.find({ _id: req.query.id, vendorId: req.vendor }).then(
          (resp) =>
            res.json({
              statusMsg: "Record Updated Successfully",
              statusCode: 200,
            })
        );
      })
      .catch((error) =>
        res.json({
          statusMsg: "Cannot find the Product" + error.message,
          statusCode: 404,
        })
      );
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    Inventory.deleteOne({
      _id: req.query.id,
      vendorId: req.vendor,
    }).then((resp) => {
      res.json({
        statusMsg:
          resp.deletedCount > 0
            ? "Record Deleted Successfully"
            : "Cannot find the Product",
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

export const uploadToInventory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });
    await Inventory.insertMany(
      data.map((val) => ({ ...val, vendorId: req.vendor })),
      { ordered: false }
    );
    res.json({
      statusMsg: "Inventory Uploaded Successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};
