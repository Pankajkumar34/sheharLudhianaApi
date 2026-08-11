const JobTypeModel = require("./jobType.model");



exports.createJobType = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      icon,
      sortOrder,
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Job type name is required",
      });
    }

    // Create slug automatically if not provided
    const generatedSlug = (
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );

    // Check duplicate
    const existingJobType =
      await JobTypeModel.findOne({
        $or: [
          {
            name: {
              $regex: `^${name.trim()}$`,
              $options: "i",
            },
          },
          {
            slug: generatedSlug,
          },
        ],
      });

    if (existingJobType) {
      return res.status(409).json({
        success: false,
        message: "Job type already exists",
      });
    }

    const jobType =
      await JobTypeModel.create({
        name: name.trim(),
        slug: generatedSlug,
        description: description?.trim() || "",
        icon: icon || "",
        sortOrder: Number(sortOrder) || 0,
      });

    return res.status(201).json({
      success: true,
      message: "Job type created successfully",
      data: jobType,
    });
  } catch (error) {
    console.error(
      "Create job type error:",
      error
    );

    // MongoDB duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Job type already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create job type",
      error: error.message,
    });
  }
};

// ==========================================
// GET JOB TYPES
// ==========================================

exports.getJobTypes = async (req, res) => {
  try {
    const {
      search,
      isActive,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Search
    if (search) {
      filter.$or = [
        {
          name: {
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
      ];
    }

    const pageNumber = Math.max(
      Number(page),
      1
    );

    const limitNumber = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const [jobTypes, total] =
      await Promise.all([
        JobTypeModel.find(filter)
          .sort({
            sortOrder: 1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        JobTypeModel.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      data: jobTypes,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        hasNextPage:
          pageNumber <
          Math.ceil(
            total / limitNumber
          ),
        hasPrevPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get job types error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job types",
      error: error.message,
    });
  }
};