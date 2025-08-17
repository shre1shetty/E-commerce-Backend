import { Stage } from "../Models/Stage.js";

export const addStage = async (req, res) => {
  try {
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
    const stages = await Stage.find().select("-__v");
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
    const stages = await Stage.find().select("stageName _id");
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
    const updatedStage = await Stage.findByIdAndUpdate(_id, req.body, {
      new: true,
    });
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
