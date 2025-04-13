import mongoose from "mongoose";
import { Layout } from "../Models/Layout.js";
import { getFileContentById } from "../server.js";
import { Filters } from "../Models/Filter.js";

export const addLayout = async (req, res) => {
  try {
    const body = req.body;
    // console.log(body.headerElement);
    body.logo = req.files
      ?.find((file) => file.fieldname === "logo")
      .id.toString();
    body.headerElement?.rows?.forEach((row, index) => {
      // console.log(row, req.files);
      row.file = req.files
        .find(
          (file) => file.fieldname === `headerElement[rows][${index}][file]`
        )
        .id.toString();
    });
    const layout = new Layout(body);
    await layout.save();
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getActiveLayout = async (req, res) => {
  try {
    let layout = await Layout.find({ isActive: true })
      .select("-__v -createdAt -updatedAt")
      .lean();
    layout = layout[0];
    if (layout)
      layout.logo = await getFileContentById(
        new mongoose.Types.ObjectId(layout.logo)
      );
    for (const row of layout.headerElement.rows) {
      row.file = await getFileContentById(
        new mongoose.Types.ObjectId(row.file)
      );
    }
    for (const category of layout.category) {
      const { subFilter } = await Filters.findOne({
        "subFilter._id": category.value,
      }).select("subFilter.$");
      if (subFilter[0].image) {
        category.image = await getFileContentById(
          new mongoose.Types.ObjectId(subFilter[0].image)
        );
      }
    }

    layout.topProduct = await Promise.all(
      layout.topProduct.map(async (product) => {
        const val = await fetch(
          `http://localhost:${process.env.PORT}/Products/getProductById?id=${product.value}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const val2 = await val.json();
        delete val2.category;
        delete val2.inStock;
        delete val2.brand;
        delete val2.sold;
        delete val2.productType;
        delete val2.fitType;
        delete val2.fabric;
        // console.log(val2);
        return val2;
      })
    );
    res.json(layout);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getLogo = async (req, res) => {
  try {
    let Logo = await Layout.find({ isActive: true }).select("logo").lean();
    let { logo } = Logo[0];
    if (logo) {
      logo = await getFileContentById(new mongoose.Types.ObjectId(logo));
    }
    res.json({ logo: logo });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const getFooter = async (req, res) => {
  try {
    const footer = await Layout.find({ isActive: true })
      .select("footerDetails")
      .lean();

    if (footer) {
      let { footerDetails } = footer[0];
      res.json({ footerDetails });
    } else {
      res.json({ footerDetails: {} });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
