import { Variants } from "../Models/Variant.js";

export const getVariant = async (req, res) => {
  try {
    const VariantItems = await Variants.find();
    res.json(
      VariantItems.map((data) => ({
        _id: data.id,
        name: data.name,
        variantCount: data.fields?.length,
        Fields: data.fields,
      }))
    );
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addVariant = async (req, res) => {
  const newItem = new Variants(req.body);
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

export const updateVariant = async (req, res) => {
  // const newItem = new Variants(req.body);

  try {
    Variants.findOneAndUpdate(
      {
        _id: req.query.id,
      },
      req.body
    )
      .then((resp) => {
        Variants.findById(req.query.id).then((resp) =>
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

export const deleteVariant = async (req, res) => {
  try {
    Variants.deleteOne({
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

export const getVariantField = async (req, res) => {
  try {
    let VariantFields;
    if (req.query.id) {
      VariantFields = await Variants.find({ _id: req.query.id }).select({
        fields: 1,
      });
      VariantFields = VariantFields.flatMap((data) => data.fields);
    } else {
      VariantFields = await Variants.find().select({
        fields: 1,
      });
      VariantFields = VariantFields.flatMap((data) => data.fields);
    }

    res.json(VariantFields);
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};

export const addVariantField = async (req, res) => {
  try {
    await Variants.findOneAndUpdate(
      {
        _id: req.query.id,
      },
      {
        $push: { fields: req.body },
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

export const updateVariantField = async (req, res) => {
  // const newItem = new Variants(req.body);
  const { name, id, _id, flag } = req.body;
  try {
    Variants.findOneAndUpdate(
      { _id: id, "fields._id": _id },
      { $set: { "fields.$.name": name, "fields.$.flag": flag } }
    )
      .then((resp) => {
        Variants.find({ _id: id, "fields._id": _id })
          .select({ fields: 1 })
          .then((resp) => {
            res.json({
              statusMsg: "Record Updated Successfully",
              statusCode: 200,
            });
          });
      })
      .catch((error) => {
        console.log(error);
        res.json({
          statusMsg: "Cannot find the Filter",
          statusCode: 404,
        });
      });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      statusMsg: error.message,
    });
  }
};

export const deleteVariantField = async (req, res) => {
  try {
    const { id, itemId } = req.body;
    Variants.findOneAndUpdate(
      { _id: id },
      { $pull: { fields: { _id: itemId } } }
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
