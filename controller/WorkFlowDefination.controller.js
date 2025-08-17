import { workFlowDefination } from "../Models/WorkFlowDefination.js";

export const addWorflowStage = async (req, res) => {
  try {
    const workFlowStage = new workFlowDefination({
      ...req.body,
      stageFrom:
        req.body.stageFrom === "" || !req.body.stageFrom
          ? "000000000000000000000000"
          : req.body.stageFrom,
    });
    await workFlowStage.save();
    res.status(201).json({
      statusMsg: "Workflow stage added successfully",
      statusCode: 201,
    });
  } catch (error) {
    console.log("Error adding workflow stage:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateWorkFlowStage = async (req, res) => {
  try {
    const { _id } = req.body;
    delete req.body._id; // Remove id from the body to avoid conflicts
    delete req.body.createdAt; // Remove createdAt to avoid conflicts with timestamps
    delete req.body.updatedAt; // Remove updatedAt to avoid conflicts with timestamps
    const updatedWorkFlowStage = await workFlowDefination.findByIdAndUpdate(
      _id,
      req.body,
      {
        new: true,
      }
    );
    if (!updatedWorkFlowStage) {
      return res.status(404).json({ message: "Workflow stage not found" });
    }
    res.status(200).json({
      statusMsg: "Workflow stage updated successfully",
      statusCode: 200,
      data: updatedWorkFlowStage,
    });
  } catch (error) {
    console.log("Error updating workflow stage:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getWorkFlowStages = async (req, res) => {
  try {
    const workFlowStages = await workFlowDefination
      .find()
      .populate([
        {
          path: "stageFrom",
          select: "stageName",
        },
        {
          path: "stageTo",
          select: "stageName",
        },
      ])
      .select("-__v");
    res.status(200).json({
      statusMsg: "Workflow stages retrieved successfully",
      statusCode: 200,
      data: workFlowStages,
    });
  } catch (error) {
    console.log("Error adding workflow stage:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkFlowStage = async (req, res) => {
  try {
    const { _id } = req.body;
    const deletedWorkFlowStage = await workFlowDefination.findByIdAndDelete(
      _id
    );
    if (!deletedWorkFlowStage) {
      return res.status(404).json({ message: "Workflow stage not found" });
    }
    res.status(200).json({
      statusMsg: "Workflow stage deleted successfully",
      statusCode: 200,
    });
  } catch (error) {
    console.log("Error deleting workflow stage:", error);
    res.status(500).json({ message: error.message });
  }
};
