import { Inventory } from "../Models/Inventory.js";

export const getInventory = async (req, res) => {
  try {
    const InventoryItems = await Inventory.find();
    res.json(InventoryItems);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addInventory = async (req, res) => {
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
  // const newItem = new Inventory(req.body);

  try {
    Inventory.findOneAndUpdate(
      {
        _id: req.query.id,
      },
      req.body
    )
      .then((resp) => {
        Inventory.findById(req.query.id).then((resp) =>
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
