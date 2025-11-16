import mongoose from "mongoose";
import { Layout } from "../Models/Layout.js";
import { deleteFile, getFileContentById } from "../server.js";
import { Filters } from "../Models/Filter.js";
import { Products } from "../Models/ProductToDisplay.js";

export const getLayouts = async (req, res) => {
  try {
    const layoutes = await Layout.find()
      .select("_id layoutName isActive")
      .lean();
    res.json(layoutes);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

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
    body.subHeaderElement?.rows?.forEach((row, index) => {
      row.file = req.files
        .find(
          (file) => file.fieldname === `subHeaderElement[rows][${index}][file]`
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

export const updateLayout = async (req, res) => {
  try {
    // Fetch the old layout values
    const oldValues = await Layout.findOne({ _id: req.query.id }).lean();
    if (!oldValues) {
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "Layout not found",
      });
    }

    const body = req.body;

    // Update logo if provided
    const logoFile = req.files?.find((file) => file.fieldname === "logo");
    if (logoFile) {
      body.logo = logoFile.id.toString();
    }

    // Update headerElement rows if provided
    if (body.headerElement?.rows) {
      body.headerElement.rows.forEach((row, index) => {
        const rowFile = req.files?.find(
          (file) => file.fieldname === `headerElement[rows][${index}][file]`
        );
        if (rowFile) {
          row.file = rowFile.id.toString();
        }
      });
    }

    if (body.subHeaderElement?.rows) {
      body.subHeaderElement.rows.forEach((row, index) => {
        const rowFile = req.files?.find(
          (file) => file.fieldname === `subHeaderElement[rows][${index}][file]`
        );
        if (rowFile) {
          row.file = rowFile.id.toString();
        }
      });
    }

    // Update the layout in the database
    Layout.findOneAndUpdate({ _id: req.query.id }, body, { new: true })
      .then((updatedLayout) => {
        if (!updatedLayout) {
          return res.status(404).json({
            statusCode: 404,
            statusMsg: "Layout not found",
          });
        }

        // Delete old files only after successful update
        if (oldValues.logo) {
          deleteFile(oldValues.logo);
        }
        if (oldValues.headerElement?.rows) {
          oldValues.headerElement.rows.forEach(({ file }) => {
            if (file) {
              deleteFile(file);
            }
          });
        }
        if (oldValues.subHeaderElement?.rows) {
          oldValues.subHeaderElement.rows.forEach(({ file }) => {
            if (file) {
              deleteFile(file);
            }
          });
        }

        res.json({
          statusMsg: "Record Updated Successfully",
          statusCode: 200,
          updatedLayout,
        });
      })
      .catch((error) => {
        console.error("Error updating layout:", error);
        res.status(500).json({
          statusCode: 500,
          statusMsg: "Server Error",
        });
      });
  } catch (error) {
    console.error("Error in updateLayout:", error);
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
    // if (layout)
    //   layout.logo = await getFileContentById(
    //     new mongoose.Types.ObjectId(layout.logo)
    //   );
    // for (const row of layout.headerElement.rows) {
    //   row.file = await getFileContentById(
    //     new mongoose.Types.ObjectId(row.file)
    //   );
    // }
    for (const category of layout.category) {
      const { subFilter } = await Filters.findOne({
        "subFilter._id": category.value,
      }).select("subFilter.$");
      if (subFilter[0].image) {
        category.image = subFilter[0].image;
      }
    }

    layout.topProduct = await Promise.all(
      layout.topProduct.map(async (product) => {
        return await Products.findOne({ _id: product.value })
          .select(
            "-__v -createdAt -updatedAt -category -inStock -brand -sold -productType -fitType -fabric"
          )
          .lean();
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

export const editLayout = async (req, res) => {
  try {
    let layout = await Layout.findOne({ _id: req.query.id })
      .select("-__v -createdAt -updatedAt")
      .lean();
    if (layout.logo && layout.logo.length > 0)
      layout.logo = await getFileContentById(
        new mongoose.Types.ObjectId(layout.logo)
      );
    for (const row of layout.headerElement.rows) {
      if (row.file && row.file.length > 0)
        row.file = await getFileContentById(
          new mongoose.Types.ObjectId(row.file)
        );
      delete row._id;
    }
    if (layout.subHeaderElement) {
      for (const row of layout.subHeaderElement?.rows) {
        if (row.file && row.file.length > 0)
          row.file = await getFileContentById(
            new mongoose.Types.ObjectId(row.file)
          );
        delete row._id;
      }
    }
    delete layout._id;
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
    // if (logo) {
    //   logo = await getFileContentById(new mongoose.Types.ObjectId(logo));
    // }
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
