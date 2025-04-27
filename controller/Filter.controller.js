import { Filters } from "../Models/Filter.js";

export const getFilter = async (req, res) => {
  try {
    const FilterItems = await Filters.find();
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

  try {
    Filters.findOneAndUpdate(
      {
        _id: req.query.id,
      },
      req.body
    )
      .then((resp) => {
        Filters.findById(req.query.id).then((resp) =>
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
      FilterItems = await Filters.find({ _id: req.query.id }).select({
        subFilter: 1,
      });
      FilterItems = FilterItems.flatMap((data) => data.subFilter);
    } else {
      FilterItems = await Filters.find().select({
        subFilter: 1,
      });
      FilterItems = FilterItems.flatMap((data) => data.subFilter);
    }

    res.json(FilterItems);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addFilterType = async (req, res) => {
  try {
    await Filters.findOneAndUpdate(
      {
        _id: req.query.id,
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
  // const newItem = new Filters(req.body);
  const { name, id, _id } = req.body;
  console.log(
    req.files.find((file) => file.fieldname === "image").id.toString()
  );
  try {
    Filters.findOneAndUpdate(
      { _id: id, "subFilter._id": _id },
      {
        $set: {
          "subFilter.$.name": name,
          "subFilter.$.image": req.files
            .find((file) => file.fieldname === "image")
            .id.toString(),
        },
      }
    )
      .then((resp) => {
        Filters.find({ _id: id, "subFilter._id": _id })
          .select({ subFilter: 1 })
          .then((resp) => {
            console.log(resp);
            res.json({
              statusMsg: "Record Updated Successfully",
              statusCode: 200,
            });
          });
      })
      .catch((error) =>
        res.json({
          statusMsg: "Cannot find the Filter",
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

export const deleteFilterType = async (req, res) => {
  try {
    const { id, itemId } = req.body;
    Filters.findOneAndUpdate(
      { _id: id },
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
    const FilterItems = await Filters.find().select(
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
