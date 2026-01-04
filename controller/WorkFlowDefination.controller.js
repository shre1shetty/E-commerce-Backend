import { populate } from "dotenv";
import { workFlowDefination } from "../Models/WorkFlowDefination.js";
import { WorkFlowModal } from "../Models/WorkFlowHistory.js";
import { Order } from "../Models/Order.js";
import eventBus from "../event/Event.js";
import mongoose from "mongoose";

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

export const getWorkFlowHistory = async (req, res) => {
  try {
    const { orderId } = req.query;
    const workFlowHistory = await WorkFlowModal.find({ orderId }).populate([
      {
        path: "createdBy",
      },
      {
        path: "workFlowStatusId",
        // populate: {
        //   path: "stageTo stageFrom",
        //   select: "stageName",
        // },
        select: "stageName",
      },
    ]);
    const workFlowDefinations = await workFlowDefination
      .find()
      .populate("stageTo");
    const filteredworkFlowDefinations = workFlowDefinations.filter(
      (item) =>
        !item.stageTo.rejectStage &&
        !workFlowHistory.some(
          (history) =>
            history.workFlowStatusId &&
            history.workFlowStatusId._id.toString() === item._id.toString()
        )
    );
    res.status(200).json({
      statusMsg: "Workflow history retrieved successfully",
      statusCode: 200,
      data: { workFlowHistory, filteredworkFlowDefinations },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getNextStage = async (req, res) => {
  try {
    const { currentStageId } = req.query;
    const nextStages = await workFlowDefination
      .find({ stageFrom: currentStageId })
      .select("stageTo stageName _id");
    res.status(200).json(nextStages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const proceedToNextStage = async (req, res) => {
  try {
    const { workFlowStatusId } = req.body;
    if (!workFlowStatusId) {
      return res.status(400).json({ message: "Missing statusId" });
    }
    const workFLowEntry = new WorkFlowModal(req.body);
    await workFLowEntry.save();
    await Order.findByIdAndUpdate(req.body.orderId, {
      statusId: req.body.statusId,
    });
    const isRejectStage = await workFlowDefination.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(workFlowStatusId) },
      },
      {
        $lookup: {
          from: "Stages",
          localField: "stageTo",
          foreignField: "_id",
          as: "stageDetails",
        },
      },
      {
        $lookup: {
          from: "Stages",
          localField: "stageFrom",
          foreignField: "_id",
          as: "currentStageDetails",
        },
      },
      {
        $project: {
          rejectStage: { $arrayElemAt: ["$stageDetails.rejectStage", 0] },
          stageFrom: { $arrayElemAt: ["$currentStageDetails.stageName", 0] },
        },
      },
    ]);
    console.log(isRejectStage);
    if (isRejectStage[0]?.rejectStage) {
      console.log("in");
      eventBus.emit("ORDER_REJECTED", {
        orderId: req.body.orderId,
        customerName: req.body.username,
        rejectionStage: isRejectStage[0].stageFrom,
        rejectionReason: req.body.remarks,
        storeName: "StoresStore",
        customerEmail: req.body.email,
      });
    }
    res
      .status(200)
      .json({ message: "Workflow updated successfully", statusCode: 200 });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Internal server error", statusCode: 500 });
  }
};
