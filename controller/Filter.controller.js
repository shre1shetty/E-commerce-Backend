import mongoose from "mongoose";
import { Filters } from "../Models/Filter.js";
import { deleteFile, getFileContentById } from "../server.js";

export const getFilter = async (req, res) => {
  try {
    const FilterItems = await Filters.find({ vendorId: req.vendor });
    res.json(
      FilterItems.map((data) => ({
        _id: data.id,
        name: data.name,
        filterCount: data.subFilter?.length,
      }))
    );
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addFilter = async (req, res) => {
  req.body.vendorId = req.vendor;
  const newItem = new Filters(req.body);
  try {
    await newItem.save();
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const updateFilter = async (req, res) => {
  // const newItem = new Filters(req.body);
  req.body.vendorId = req.vendor;
  try {
    Filters.findOneAndUpdate(
      {
        _id: req.query.id,
        vendorId: req.vendor,
      },
      req.body
    )
      .then((resp) => {
        Filters.findBy({ id: req.query.id, vendorId: req.vendor }).then(
          (resp) =>
            res.json({
              statusMsg: "Record Updated Successfully",
              statusCode: 200,
            })
        );
      })
      .catch((error) =>
        res.json({
          statusMsg: "Cannot find the Filter" + error.message,
          statusCode: 404,
        })
      );
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const deleteFilter = async (req, res) => {
  try {
    Filters.deleteOne({
      _id: req.query.id,
      vendorId: req.vendor,
    }).then((resp) => {
      res.json({
        statusMsg:
          resp.deletedCount > 0
            ? "Record Deleted Successfully"
            : "Cannot find the Filter",
        statusCode: resp.deletedCount > 0 ? 200 : 404,
      });
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getFilterType = async (req, res) => {
  try {
    let FilterItems;
    if (req.query.id) {
      FilterItems = await Filters.find({
        _id: req.query.id,
        vendorId: req.vendor,
      })
        .select({
          subFilter: 1,
        })
        .lean();
      FilterItems = FilterItems.flatMap((data) => data.subFilter);
      for (const filterItem of FilterItems) {
        if (filterItem.image) {
          const image = await getFileContentById(
            new mongoose.Types.ObjectId(filterItem.image),
            req.vendor
          );
          filterItem.image = image;
        }
      }
    } else {
      FilterItems = await Filters.find({ vendorId: req.vendor }).select({
        subFilter: 1,
      });
      FilterItems = FilterItems.flatMap((data) => data.subFilter);
    }

    res.json(FilterItems);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addFilterType = async (req, res) => {
  try {
    req.body.vendorId = req.vendor;
    req.body.image = req.files
      .find((file) => file.fieldname === "image")
      .id.toString();
    await Filters.findOneAndUpdate(
      {
        _id: req.query.id,
        vendorId: req.vendor,
      },
      {
        $push: { subFilter: req.body },
      }
    );
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};
export const updateFilterType = async (req, res) => {
  const session = await mongoose.startSession();
  const { name, id, _id } = req.body;

  try {
    session.startTransaction();

    const imageFile = req.files?.find((file) => file.fieldname === "image");
    const existing = await Filters.findOne(
      { _id: id, "subFilter._id": _id, vendorId: req.vendor },
      { "subFilter.$": 1 },
      { session }
    ).lean();

    if (!existing) {
      throw new Error("SubFilter not found");
    }

    const oldImageId = existing.subFilter[0].image;
    console.log(oldImageId);
    await Filters.findOneAndUpdate(
      { _id: id, "subFilter._id": _id, vendorId: req.vendor },
      {
        $set: {
          "subFilter.$.name": name,
          ...(imageFile && {
            "subFilter.$.image": imageFile.id.toString(),
          }),
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    if (imageFile && oldImageId) {
      await deleteFile(new mongoose.Types.ObjectId(oldImageId), req.vendor);
    }

    res.json({
      statusMsg: "Record Updated Successfully",
      statusCode: 200,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const toggleShowOnSearch = async (req, res) => {
  try {
    const { showOnSearch, id, _id } = req.body;
    if (!id || !id)
      res.status(400).json({
        statusCode: 400,
        statusMsg: "Invalid Data",
      });
    await Filters.findOneAndUpdate(
      {
        _id: id,
        "subFilter._id": _id,
        vendorId: req.vendor,
      },
      {
        $set: {
          "subFilter.$.showOnSearch": showOnSearch,
        },
      }
    );
    res.status(200).json({
      statusMsg: "Record Updated Succesfully",
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const deleteFilterType = async (req, res) => {
  try {
    const { id, itemId } = req.body;
    const filter = await Filters.findOne(
      { _id: id, vendorId: req.vendor },
      { subFilter: { $elemMatch: { _id: itemId } } }
    );

    if (!filter || !filter.subFilter.length) {
      return res.status(404).json({ message: "SubFilter not found" });
    }

    const imageId = filter.subFilter[0].image;
    if (imageId) {
      await deleteFile(new mongoose.Types.ObjectId(imageId), req.vendor);
    }
    Filters.findOneAndUpdate(
      { _id: id, vendorId: req.vendor },
      { $pull: { subFilter: { _id: itemId } } }
    ).then((resp) => {
      res.json({
        statusMsg: "Record Deleted Successfully",
        statusCode: 200,
      });
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getFilterWithSubFilter = async (req, res) => {
  try {
    const FilterItems = await Filters.find({ vendorId: req.vendor }).select(
      "-createdAt -updatedAt -__v -subFilter.image"
    );
    if (FilterItems.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        statusMsg: "No Filter Found",
      });
    }
    res.status(200).json({
      data: FilterItems,
      statusCode: 200,
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const getOptionsForSearch = async (req, res) => {
  try {
    const response = await Filters.aggregate([
      {
        $match: { vendorId: req.vendor },
      },
      {
        $unwind: "$subFilter",
      },
      {
        $match: { "subFilter.showOnSearch": true },
      },
      {
        $lookup: {
          from: "Filters",
          let: { parentId: "$_id" },
          pipeline: [
            {
              $match: { $expr: { $ne: ["$_id", "$$parentId"] } },
            },
          ],
          as: "otherFilters",
        },
      },

      {
        $project: {
          name: "$subFilter.name",
          _id: "$subFilter._id",
          otherFilters: {
            $map: {
              input: "$otherFilters",
              as: "of",
              in: {
                _id: "$$of._id",
                name: "$$of.name",
                subFilter: "$$of.subFilter",
              },
            },
          },
        },
      },
    ]);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};
