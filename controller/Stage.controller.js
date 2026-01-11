import { Stage } from "../Models/Stage.js";

export const addStage = async (req, res) => {
  try {
    req.body.vendorId = req.vendor;
    const newStage = new Stage(req.body);
    await newStage.save();
    res.status(201).json({
      statusMsg: "Stage added successfully",
      statusCode: 201,
    });
  } catch (error) {
    console.log("Error adding stage:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getStages = async (req, res) => {
  try {
    const stages = await Stage.find({ vendorId: req.vendor }).select(
      "-__v -vendorId"
    );
    res.status(200).json({
      statusMsg: "Stages retrieved successfully",
      statusCode: 200,
      data: stages,
    });
  } catch (error) {
    console.log("Error while retrieving stages:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getStagesForDrpDown = async (req, res) => {
  try {
    const stages = await Stage.find({ vendorId: req.vendor }).select(
      "stageName _id"
    );
    res.status(200).json({
      statusMsg: "Stages for dropdown retrieved successfully",
      statusCode: 200,
      data: stages,
    });
  } catch (error) {
    console.log("Error while retrieving stages:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateStage = async (req, res) => {
  try {
    const { _id } = req.body;
    delete req.body.id; // Remove id from the body to avoid conflicts
    delete req.body.createdAt; // Remove createdAt to avoid conflicts with timestamps
    delete req.body.updatedAt; // Remove updatedAt to avoid conflicts with timestamps
    req.body.vendorId = req.vendor;
    const updatedStage = await Stage.findOneAndUpdate(
      { _id: _id, vendorId: req.vendor },
      req.body,
      {
        new: true,
      }
    );
    if (!updatedStage) {
      return res.status(404).json({ message: "Stage not found" });
    }
    res.status(200).json({
      statusMsg: "Stage updated successfully",
      statusCode: 200,
      data: updatedStage,
    });
  } catch (error) {
    console.log("Error updating stage:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteStage = async (req, res) => {
  try {
    Stage.deleteOne({
      _id: req.query._id,
      vendorId: req.vendor,
    }).then((resp) => {
      res.json({
        statusMsg:
          resp.deletedCount > 0
            ? "Record Deleted Successfully"
            : "Cannot find the Stage",
        statusCode: resp.deletedCount > 0 ? 200 : 404,
      });
    });
  } catch (error) {
    console.log("Error updating stage:", error);
    res.status(500).json({ message: error.message });
  }
};
