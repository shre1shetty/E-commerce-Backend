import mongoose from "mongoose";
import { Address } from "../Models/Address.js";

export const addAddress = async (req, res) => {
  try {
    const newAddress = new Address(req.body);
    await newAddress.save();
    res.status(201).json({ message: "Address inserted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while inserting address" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const id = req.body._id;
    delete req.body._id;
    await Address.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
      },
      req.body
    );
    res.status(201).json({ message: "Address updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while inserting address" });
  }
};

export const getAllAddressesById = async (req, res) => {
  try {
    const { userId } = req.query;
    const addresses = await Address.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .select("-__v -createdAt -updatedAt")
      .lean();
    res.status(200).json(addresses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while fetching addresses" });
  }
};
