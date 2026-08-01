const categoryModel = require("./categories.model");

exports.getCategoriesList = async (req, res) => {
  try {
    const categories = await categoryModel
      .find({ isActive: true })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    console.error("Error in getCategoriesList:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};