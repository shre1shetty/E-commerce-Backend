import mongoose from "mongoose";
import { Layout } from "../Models/Layout.js";
import { deleteFile, getFileContentById } from "../server.js";
import { Filters } from "../Models/Filter.js";
import { Products } from "../Models/ProductToDisplay.js";

export const getLayouts = async (req, res) => {
  try {
    const layoutes = await Layout.find({ vendorId: req.vendor })
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
    body.vendorId = req.vendor;
    // console.log(body.headerElement);
    body.logo = req.files
      ?.find((file) => file.fieldname === "logo")
      .id.toString();
    body.headerElement?.rows?.forEach((row, index) => {
      // console.log(row, req.files);
      row.file = req.files
        .find(
          (file) => file.fieldname === `headerElement[rows][${index}][file]`,
        )
        .id.toString();
    });
    body.subHeaderElement?.rows?.forEach((row, index) => {
      row.file = req.files
        .find(
          (file) => file.fieldname === `subHeaderElement[rows][${index}][file]`,
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
    const oldValues = await Layout.findOne({
      _id: req.query.id,
      vendorId: req.vendor,
    }).lean();
    if (!oldValues) {
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "Layout not found",
      });
    }

    const body = req.body;
    body.vendorId = req.vendor;
    // Update logo if provided
    const logoFile = req.files?.find((file) => file.fieldname === "logo");
    if (logoFile) {
      body.logo = logoFile.id.toString();
    }

    // Update headerElement rows if provided
    if (body.headerElement?.rows) {
      body.headerElement.rows.forEach((row, index) => {
        const rowFile = req.files?.find(
          (file) => file.fieldname === `headerElement[rows][${index}][file]`,
        );
        if (rowFile) {
          row.file = rowFile.id.toString();
        }
      });
    }

    if (body.subHeaderElement?.rows) {
      body.subHeaderElement.rows.forEach((row, index) => {
        const rowFile = req.files?.find(
          (file) => file.fieldname === `subHeaderElement[rows][${index}][file]`,
        );
        if (rowFile) {
          row.file = rowFile.id.toString();
        }
      });
    }

    if (body.sections) {
      body.sections.forEach((row, index) => {
        const rowFile = req.files?.find(
          (file) => file.fieldname === `sections[${index}][overlayBgImage]`,
        );
        if (rowFile) {
          row.overlayBgImage = rowFile.id.toString();
        }
      });
    }

    // Update the layout in the database
    Layout.findOneAndUpdate({ _id: req.query.id, vendorId: req.vendor }, body, {
      upsert: true,
      new: true,
    })
      .select("-vendorId")
      .then((updatedLayout) => {
        if (!updatedLayout) {
          return res.status(404).json({
            statusCode: 404,
            statusMsg: "Layout not found",
          });
        }

        // Delete old files only after successful update
        if (oldValues.logo) {
          deleteFile(oldValues.logo, req.vendor);
        }
        if (oldValues.headerElement?.rows) {
          oldValues.headerElement.rows.forEach(({ file }) => {
            if (file) {
              deleteFile(file, req.vendor);
            }
          });
        }
        if (oldValues.subHeaderElement?.rows) {
          oldValues.subHeaderElement.rows.forEach(({ file }) => {
            if (file) {
              deleteFile(file, req.vendor);
            }
          });
        }

        if (oldValues.sections) {
          oldValues.sections.forEach(({ overlayBgImage }) => {
            if (overlayBgImage) {
              deleteFile(overlayBgImage, req.vendor);
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

export const toggleLayoutActiveStatus = async (req, res) => {
  try {
    const { layoutId, isActive } = req.body;
    await Layout.updateOne(
      { _id: layoutId, vendorId: req.vendor },
      { isActive: isActive },
    );
    res.status(200).json({
      statusMsg: "Layout status updated successfully",
      statusCode: 200,
    });
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
    const layout = await Layout.findOne({
      isActive: true,
      vendorId: req.vendor,
    })
      .select("-__v -createdAt -updatedAt -vendorId")
      .lean();

    //category-start
    const categoryIds = layout.category.map((c) => c.value);
    const filters = await Filters.find({
      "subFilter._id": { $in: categoryIds },
    });
    const map = {};
    filters.forEach((f) => {
      f.subFilter.forEach((sf) => {
        map[sf._id] = sf.image;
      });
    });
    layout.category = layout.category.map((cat) => ({
      ...cat,
      image: map[cat.value] || null,
    }));
    //category-end

    //sections-start
    const sectionIds = layout.sections.reduce(
      (acc, { products }) => (acc = [...acc, ...products.map((p) => p.value)]),
      [],
    );

    const FilteredProducts = await Products.find({
      _id: { $in: sectionIds },
    })
      .select(
        "-__v -createdAt -updatedAt -category -inStock -brand -sold -productType -fitType -fabric",
      )
      .lean();

    layout.sections = layout.sections.map((val) => ({
      ...val,
      products: val.products.map(({ value }) =>
        FilteredProducts.find(({ _id }) => value.toString() === _id.toString()),
      ),
    }));

    //sections-end

    // layout.topProduct = await Promise.all(
    //   layout.topProduct.map(async (product) => {
    //     return await Products.findOne({ _id: product.value })
    //       .select(
    //         "-__v -createdAt -updatedAt -category -inStock -brand -sold -productType -fitType -fabric"
    //       )
    //       .lean();
    //   })
    // );
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
    let layout = await Layout.findOne({
      _id: req.query.id,
      vendorId: req.vendor,
    })
      .select("-__v -createdAt -updatedAt -vendorId")
      .lean();
    if (layout.logo && layout.logo.length > 0)
      layout.logo = await getFileContentById(
        new mongoose.Types.ObjectId(layout.logo),
        req.vendor,
      );
    for (const row of layout.headerElement.rows) {
      if (row.file && row.file.length > 0)
        row.file = await getFileContentById(
          new mongoose.Types.ObjectId(row.file),
          req.vendor,
        );
      delete row._id;
    }
    for (const section of layout.sections) {
      if (section.overlayBgImage && section.overlayBgImage !== "")
        section.overlayBgImage = await getFileContentById(
          new mongoose.Types.ObjectId(section.overlayBgImage),
          req.vendor,
        );
      delete section._id;
    }
    if (layout.subHeaderElement && layout.subHeaderElement.rows) {
      for (const row of layout.subHeaderElement?.rows) {
        if (row.file && row.file.length > 0)
          row.file = await getFileContentById(
            new mongoose.Types.ObjectId(row.file),
            req.vendor,
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
    let Logo = await Layout.find({ isActive: true, vendorId: req.vendor })
      .select("logo")
      .lean();
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
    const footer = await Layout.find({ isActive: true, vendorId: req.vendor })
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
