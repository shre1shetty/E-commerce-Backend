import { Vendor } from "../Models/Vendor.js";

export const createVendor = async (req, res) => {
  try {
    const vendor = new Vendor(req.body);
    await vendor.save(req.body);
    return res.status(200).json({ statusMsg: "Vendor Created Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json("Error creating vendor");
  }
};
