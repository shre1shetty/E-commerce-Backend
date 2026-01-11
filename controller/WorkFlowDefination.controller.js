import { workFlowDefination } from "../Models/WorkFlowDefination.js";
import { WorkFlowModal } from "../Models/WorkFlowHistory.js";
import { Order } from "../Models/Order.js";
import eventBus from "../event/Event.js";
import mongoose from "mongoose";
import Razorpay from "razorpay";

export const addWorflowStage = async (req, res) => {
  try {
    const workFlowStage = new workFlowDefination({
      ...req.body,
      vendorId: req.vendor,
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
    req.body.vendorId = req.vendor;
    delete req.body._id; // Remove id from the body to avoid conflicts
    delete req.body.createdAt; // Remove createdAt to avoid conflicts with timestamps
    delete req.body.updatedAt; // Remove updatedAt to avoid conflicts with timestamps
    const updatedWorkFlowStage = await workFlowDefination.findOneAndUpdate(
      { _id: _id, vendorId: req.vendor },
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
    });
  } catch (error) {
    console.log("Error updating workflow stage:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getWorkFlowStages = async (req, res) => {
  try {
    const workFlowStages = await workFlowDefination
      .find({ vendorId: req.vendor })
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
      .select("-__v -vendorId");
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
    const deletedWorkFlowStage = await workFlowDefination.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(_id),
      vendorId: req.vendor,
    });
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
    const workFlowHistory = await WorkFlowModal.find({
      orderId,
      vendorId: req.vendor,
    })
      .populate([
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
      ])
      .select("-vendorId");
    const workFlowDefinations = await workFlowDefination
      .find({ vendorId: req.vendor })
      .populate("stageTo")
      .select("-vendorId");
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
      .find({ stageFrom: currentStageId, vendorId: req.vendor })
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
    req.body.vendorId = req.vendor;
    if (!workFlowStatusId) {
      return res.status(400).json({ message: "Missing statusId" });
    }
    const workFLowEntry = new WorkFlowModal(req.body);
    await workFLowEntry.save();
    const isRejectStage = await workFlowDefination.aggregate([
      {
        $match: {
          vendorId: req.vendor,
        },
      },
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

    await Order.findOneAndUpdate(
      { _id: req.body.orderId, vendorId: req.vendor },
      {
        statusId: req.body.statusId,
        isRejected: isRejectStage[0].rejectStage,
      }
    );

    if (isRejectStage[0]?.rejectStage) {
      const { paymentId, amount } = req.body;
      if (paymentId && paymentId !== "" && paymentId !== "COD") {
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_SECRET,
        });
        const resp = await instance.payments.refund(paymentId, {
          amount: amount * 100,
        });
        console.log(resp);
      }

      eventBus.emit("ORDER_REJECTED", {
        orderId: req.body.orderId,
        vendorId: req.vendor,
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

export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { _id, userId, remarks } = req.body;
    if (!_id || !userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400);
    }
    const order = await Order.findOne({
      _id: new mongoose.Types.ObjectId(_id),
      userId: new mongoose.Types.ObjectId(userId),
      vendorId: req.vendor,
    })
      .select("amount statusId paymentId isRejected")
      .session(session);

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401);
    }

    if (order.isRejected) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Order already cancelled" });
    }

    const {
      _id: orderId,
      statusId: workFlowStatusId,
      paymentId,
      amount,
    } = order;

    const rejectStage = await workFlowDefination.aggregate([
      {
        $match: {
          $and: [{ stageFrom: workFlowStatusId }, { vendorId: req.vendor }],
        },
      },
      {
        $lookup: {
          from: "Stages",
          let: { parentId: "$stageTo" },
          pipeline: [
            {
              $match: {
                $and: [
                  {
                    $expr: {
                      $eq: ["$_id", "$$parentId"],
                    },
                  },
                  {
                    rejectStage: true,
                  },
                ],
              },
            },
          ],
          as: "rejectStage",
        },
      },
      {
        $unwind: "$rejectStage",
      },
      {
        $match: {
          rejectStage: { $exists: true, $ne: [] },
        },
      },
      {
        $project: {
          rejectstatusId: "$rejectStage._id",
        },
      },
    ]);

    if (!rejectStage.length || !rejectStage[0].rejectstatusId) {
      throw new Error("Reject workflow not configured");
    }

    const workFLowEntry = new WorkFlowModal({
      workFlowStatusId: rejectStage[0]._id,
      createdBy: userId,
      remarks,
      orderId,
      vendorId: req.vendor,
    });
    await workFLowEntry.save({ session });
    await Order.findOneAndUpdate(
      { _id: orderId, vendorId: req.vendor },
      {
        statusId: rejectStage[0].rejectstatusId,
        isRejected: true,
        refund: {
          amount,
          status: paymentId !== "COD" ? "PENDING" : "COD",
          paymentId,
          initiatedAt: new Date(),
        },
      },
      { session }
    );
    await session.commitTransaction();
    session.endSession();
    if (paymentId && paymentId !== "" && paymentId !== "COD") {
      try {
        const instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_SECRET,
        });
        const refund = await instance.payments.refund(paymentId, {
          amount: amount * 100,
        });
        await Order.updateOne(
          { _id: orderId, vendorId: req.vendor },
          {
            "refund.status": "SUCCESS",
            "refund.refundId": refund.id,
            completedAt: new Date(),
          }
        );
      } catch (error) {
        await Order.updateOne(
          { _id: order._id },
          { "refund.status": "FAILED" }
        );
      }
    }
    res
      .status(200)
      .json({ message: "Order canceled successfully", statusCode: 200 });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
    res.status(500).json({ message: "Error while cancellation" });
  }
};
