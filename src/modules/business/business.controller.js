const businessModel = require("./business.model")

exports.createBusiness = async (req, res) => {
    try {
        const {
            businessName,
            category,
            description,
            phone,
            whatsapp,
            email,
            address,
            area,
            hours,
            photoUrls,
            latitude,
            longitude,
        } = req.body;

        if (!businessName) {
            return res.status(400).json({
                status: false,
                message: "Business name is required",
            });
        }

        if (!category) {
            return res.status(400).json({
                status: false,
                message: "Category is required",
            });
        }

        if (!description) {
            return res.status(400).json({
                status: false,
                message: "Description is required",
            });
        }

        if (!phone) {
            return res.status(400).json({
                status: false,
                message: "Phone number is required",
            });
        }

        if (!address) {
            return res.status(400).json({
                status: false,
                message: "Address is required",
            });
        }

        if (!area) {
            return res.status(400).json({
                status: false,
                message: "Area is required",
            });
        }

        const business = await businessModel.create({
            userId: req.user._id,
            businessName,
            category,
            description,
            phone,
            whatsapp,
            email,
            address,
            area,
            hours,
            photos: photoUrls || [],
            location: {
                type: "Point",
                coordinates: [Number(longitude), Number(latitude)],
            },
        });

        return res.status(201).json({
            status: true,
            message: "Business created successfully",
            data: business,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.myBusinesses = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [businesses, total] = await Promise.all([
            businessModel
                .find({ userId: req.user._id })
                .populate("category", "name")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            businessModel.countDocuments({ userId: req.user._id }),
        ]);

        return res.status(200).json({
            status: true,
            message: "My businesses fetched successfully",
            data: businesses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: error.message,
        });
    }
};

exports.getNearbyBusinesses = async (req, res) => {
  try {
    const {
      longitude,
      latitude,
      radius = 5,
      search,
      category,
      area,
      isVerified = "true",
    } = req.query;

    // -------------------------
    // Validate location
    // -------------------------
    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude are required",
      });
    }

    const lng = Number(longitude);
    const lat = Number(latitude);
    const radiusKm = Number(radius);

    if (
      Number.isNaN(lng) ||
      Number.isNaN(lat) ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude or latitude",
      });
    }

    if (Number.isNaN(radiusKm) || radiusKm <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid radius",
      });
    }

    // -------------------------
    // Build filters
    // -------------------------
    const filter = {
      isVerified: isVerified === "true",
    };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Area filter
    if (area) {
      filter.area = {
        $regex: area,
        $options: "i",
      };
    }

    // Search business name, description,
    // area and keywords
    if (search) {
      filter.$or = [
        {
          businessName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          area: {
            $regex: search,
            $options: "i",
          },
        },
        {
          keywords: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // -------------------------
    // Nearby businesses
    // -------------------------
    const businesses = await businessModel
      .find({
        ...filter,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat],
            },
            $maxDistance: radiusKm * 1000,
          },
        },
      })
      .populate("category", "name")
      .select("-__v");

    return res.status(200).json({
      success: true,
      count: businesses.length,
      radius: `${radiusKm} KM`,
      data: businesses,
    });
  } catch (error) {
    console.error("Nearby business error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch nearby businesses",
      error: error.message,
    });
  }
};
exports.getBusinessById = async (req, res) => {
  try {
    const { id } = req.params;

    const businessDetails = await businessModel
      .findById(id)
      .populate("category", "name")
        .populate("userId", "fullName phoneNumber");

    if (!businessDetails) {
      return res.status(404).json({
        status: false,
        message: "Business not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Business details fetched successfully",
      data: businessDetails,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

exports.getAllBusinesses = async (req, res) => {
  try {
    const {
      category,
      search,
      lat,
      lng,
      radius = 5000,
    } = req.query;

    const filter = {};

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Search
    if (search) {
      filter.$or = [
        {
          businessName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
        {
          address: {
            $regex: search,
            $options: "i",
          },
        },
        {
          area: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // Nearby Search
    if (lat && lng) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius), // default 5 KM
        },
      };
    }

    const businesses = await businessModel
      .find(filter)
      .populate("category", "name")
      .populate("userId", "fullName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: businesses.length,
      data: businesses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};