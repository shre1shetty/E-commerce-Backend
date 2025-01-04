import { Products } from "../Models/ProductToDisplay.js";

export const addProduct = async (req, res) => {
  try {
    // console.log(req.body);
    // req.body.pictures = req.body.pictures.map((picture) => uploadFile(picture));
    // req.body.variantValues = req.body.variantValues.map((variant) => ({
    //   ...variant,
    //   picture: uploadFile(variant.picture),
    // }));
    const body = req.body;
    body.variantValues.forEach((variant, index) => {
      const pictureKey = `variantValues[${index}][values][picture]`;
      const uploadedPicture = req.files.find(
        (file) => file.fieldname === pictureKey
      );
      // console.log(uploadedPicture, index, variant);
      if (uploadedPicture) {
        // Assign the file ID (from GridFS) to the variant's picture
        variant.values.picture = uploadedPicture.id.toString(); // Save the file ID
      }
    });

    // console.log(body);
    const product = new Products(body);
    await product.save();
    res.json({ statusMsg: "Record Saved Succesfully", statusCode: 200 });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      statusMsg: "Server Error",
    });
  }
};
