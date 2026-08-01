const UserModel = require("./user.model")

exports.completeProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, role, businessCategory, address } = req.body;

    const updateData = {
      fullName,
      phone,
      role,
      address,
      isProfileCompleted: true,
      isPhoneVerified: true
    };

    if (["BUSINESS_OWNER", "ADMIN", "SUPER_ADMIN"].includes(role)) {
      updateData.businessCategory = businessCategory;
    } else {
      updateData.businessCategory = null;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};