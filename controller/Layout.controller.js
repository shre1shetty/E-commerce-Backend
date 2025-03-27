import { Layout } from "../Models/Layout.js";

export const addLayout = async (req, res) => {
  try {
    const body = req.body;
    console.log(body.headerElement);
    body.logo = req.files
      ?.find((file) => file.fieldname === "logo")
      .id.toString();
    body.headerElement?.rows?.forEach((row, index) => {
      console.log(row, req.files);
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
