const { generateSlug } = require("../../utils/slugFn");
const JobCategory = require("./jobCategory.schema");
const CompanyModel = require("./company.schema");
const candidateModel = require("./company.schema");

exports.createJobCategory = async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      icon,
      image,
      sortOrder,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    // Slug generate
    const categorySlug = generateSlug(name) || slug;
    

    // Check duplicate name
    const existingName = await JobCategory.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Job category already exists",
      });
    }

    const existingSlug = await JobCategory.findOne({
      slug: categorySlug,
    });

    if (existingSlug) {
      return res.status(409).json({
        success: false,
        message: "Category slug already exists",
      });
    }

    const category = await JobCategory.create({
      name: name.trim(),
      slug: categorySlug,
      description: description?.trim() || "",
      icon: icon || "",
      image: image || "",
      sortOrder: Number(sortOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Job category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("createJobCategory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create job category",
      error: error.message,
    });
  }
};
exports.getJobCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      isActive,
    } = req.query;

    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const limitNumber = Math.max(parseInt(limit) || 10, 1);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    // Search
    if (search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Active / Inactive filter
    if (isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    const [categories, total] = await Promise.all([
      JobCategory.find(query)
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      JobCategory.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      success: true,
      message: "Job categories fetched successfully",

      data: categories,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("getJobCategories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job categories",
      error: error.message,
    });
  }
};
exports.getJobCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await JobCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Job category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job category fetched successfully",
      data: category,
    });
  } catch (error) {
    console.error("getJobCategoryById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job category",
      error: error.message,
    });
  }
};
exports.deleteJobCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await JobCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Job category not found",
      });
    }

    await JobCategory.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Job category deleted successfully",
    });
  } catch (error) {
    console.error("deleteJobCategory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job category",
      error: error.message,
    });
  }
};
exports.updateJobCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      icon,
      image,
      isActive,
      sortOrder,
    } = req.body;

    const category = await JobCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Job category not found",
      });
    }

    // Name duplicate check
    if (name && name.trim() !== category.name) {
      const existingName = await JobCategory.findOne({
        name: {
          $regex: `^${name.trim()}$`,
          $options: "i",
        },
        _id: { $ne: id },
      });

      if (existingName) {
        return res.status(409).json({
          success: false,
          message: "Job category name already exists",
        });
      }

      // Automatically generate new slug
      const newSlug = generateSlug(name);

      const existingSlug = await JobCategory.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });

      if (existingSlug) {
        return res.status(409).json({
          success: false,
          message: "Generated slug already exists",
        });
      }

      category.name = name.trim();
      category.slug = newSlug;
    }

    if (description !== undefined) {
      category.description = description.trim();
    }

    if (icon !== undefined) {
      category.icon = icon;
    }

    if (image !== undefined) {
      category.image = image;
    }

    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    if (sortOrder !== undefined) {
      category.sortOrder = Number(sortOrder);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Job category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("updateJobCategory error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update job category",
      error: error.message,
    });
  }
};

exports.createCompany = async (req, res) => {
    try {
        const {
            companyName,
            jobCategoryId,
            logo,
            coverImage,
            description,
            website,
            email,
            phoneNumber,
            companySize,
            foundedYear,
            address,
            city,
            state,
            country,
            socialLinks,
        } = req.body;

        if (!companyName || !jobCategoryId) {
            return res.status(400).json({
                success: false,
                message: "Company name and category are required",
            });
        }

        const existingCompany = await CompanyModel.findOne({
            user:  "6a6cae03264c06ca92f020f0" ,
        });

        if (existingCompany) {
            return res.status(409).json({
                success: false,
                message: "Company profile already exists",
            });
        }

        const jobCategory = await JobCategory.findOne({
            _id: jobCategoryId,
            isActive: true,
        });

        if (!jobCategory) {
            return res.status(404).json({
                success: false,
                message: "Job category not found or inactive",
            });
        }

        // Generate slug
        const baseSlug = generateSlug(companyName);

        let slug = baseSlug;
        let counter = 1;

        while (await CompanyModel.findOne({ slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        const company = await CompanyModel.create({
            user: "6a6cae03264c06ca92f020f0",
            companyName: companyName.trim(),
            slug,
            jobCategoryId,
            logo: logo || "",
            coverImage: coverImage || "",
            description: description || "",
            website: website || "",
            email: email || "",
            phoneNumber: phoneNumber || "",
            companySize: companySize || "1-10",
            foundedYear: foundedYear || undefined,
            address: address || "",
            city: city || "",
            state: state || "",
            country: country || "India",

            socialLinks: {
                linkedin: socialLinks?.linkedin || "",
                instagram: socialLinks?.instagram || "",
                facebook: socialLinks?.facebook || "",
                twitter: socialLinks?.twitter || "",
            },
        });

        const populatedCompany = await CompanyModel.findById(
            company._id
        ).populate("jobCategoryId", "name slug");

        return res.status(201).json({
            success: true,
            message: "Company created successfully",
            data: populatedCompany,
        });

    } catch (error) {
        console.error("createCompany error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create company",
            error: error.message,
        });
    }
};

exports.getCompanies = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            category,
            isActive,
        } = req.query;

        const pageNumber = Math.max(parseInt(page) || 1, 1);
        const limitNumber = Math.max(parseInt(limit) || 10, 1);

        const skip = (pageNumber - 1) * limitNumber;

        const query = {};

        // Search
        if (search.trim()) {
            query.$or = [
                {
                    companyName: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
                {
                    description: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
                {
                    city: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
                {
                    state: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
            ];
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Active / inactive
        if (isActive !== undefined && isActive !== "") {
            query.isActive = isActive === "true";
        }

        const [companies, total] = await Promise.all([
            CompanyModel.find(query)
                .populate("jobCategoryId", "name slug")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNumber)
                .lean(),

            CompanyModel.countDocuments(query),
        ]);

        const totalPages = Math.ceil(total / limitNumber);

        return res.status(200).json({
            success: true,
            message: "Companies fetched successfully",
            data: companies,

            pagination: {
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1,
            },
        });

    } catch (error) {
        console.error("getCompanies error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch companies",
            error: error.message,
        });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await CompanyModel.findById(id)
            .populate("jobCategoryId", "name slug description")
            .populate("user", "fullName email phoneNumber");

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Company fetched successfully",
            data: company,
        });

    } catch (error) {
        console.error("getCompanyById error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch company",
            error: error.message,
        });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            companyName,
            category,
            logo,
            coverImage,
            description,
            website,
            email,
            phoneNumber,
            companySize,
            foundedYear,
            address,
            city,
            state,
            country,
            socialLinks,
        } = req.body;

        const company = await CompanyModel.findById(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        // Category validation
        if (category) {
            const jobCategory = await JobCategory.findOne({
                _id: category,
                isActive: true,
            });

            if (!jobCategory) {
                return res.status(404).json({
                    success: false,
                    message: "Job category not found or inactive",
                });
            }

            company.category = category;
        }

        // Company name + slug
        if (
            companyName &&
            companyName.trim() !== company.companyName
        ) {
            const baseSlug = generateSlug(companyName);

            let slug = baseSlug;
            let counter = 1;

            while (
                await CompanyModel.findOne({
                    slug,
                    _id: { $ne: id },
                })
            ) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }

            company.companyName = companyName.trim();
            company.slug = slug;
        }

        if (logo !== undefined) {
            company.logo = logo;
        }

        if (coverImage !== undefined) {
            company.coverImage = coverImage;
        }

        if (description !== undefined) {
            company.description = description;
        }

        if (website !== undefined) {
            company.website = website;
        }

        if (email !== undefined) {
            company.email = email;
        }

        if (phoneNumber !== undefined) {
            company.phoneNumber = phoneNumber;
        }

        if (companySize !== undefined) {
            company.companySize = companySize;
        }

        if (foundedYear !== undefined) {
            company.foundedYear = foundedYear;
        }

        if (address !== undefined) {
            company.address = address;
        }

        if (city !== undefined) {
            company.city = city;
        }

        if (state !== undefined) {
            company.state = state;
        }

        if (country !== undefined) {
            company.country = country;
        }

        if (socialLinks) {
            company.socialLinks = {
                linkedin:
                    socialLinks.linkedin ??
                    company.socialLinks.linkedin,

                instagram:
                    socialLinks.instagram ??
                    company.socialLinks.instagram,

                facebook:
                    socialLinks.facebook ??
                    company.socialLinks.facebook,

                twitter:
                    socialLinks.twitter ??
                    company.socialLinks.twitter,
            };
        }

        await company.save();

        const updatedCompany = await CompanyModel.findById(
            company._id
        ).populate("category", "name slug");

        return res.status(200).json({
            success: true,
            message: "Company updated successfully",
            data: updatedCompany,
        });

    } catch (error) {
        console.error("updateCompany error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update company",
            error: error.message,
        });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await CompanyModel.findById(id);

        if (!company) {
            return res.status(404).json({
                success: false,
                message: "Company not found",
            });
        }

        await CompanyModel.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Company deleted successfully",
        });

    } catch (error) {
        console.error("deleteCompany error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete company",
            error: error.message,
        });
    }
};


exports.createCandidate = async (req, res) => {
    try {
        const {
            profileImage,
            headline,
            bio,
            categories,
            skills,
            experience,
            experienceLevel,
            currentCompany,
            currentSalary,
            expectedSalary,
            preferredJobTitle,
            preferredLocations,
            resume,
            portfolio,
            linkedin,
            github,
            availability,
            isOpenToWork,
        } = req.body;

        // Check candidate already exists
        const existingCandidate = await CandidateProfile.findOne({
            user: req.user.id,
        });

        if (existingCandidate) {
            return res.status(409).json({
                success: false,
                message: "Candidate profile already exists",
            });
        }

        // Validate categories
        if (categories && categories.length > 0) {
            const categoryCount = await JobCategory.countDocuments({
                _id: { $in: categories },
                isActive: true,
            });

            if (categoryCount !== categories.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more job categories are invalid or inactive",
                });
            }
        }

        const candidate = await CandidateProfile.create({
            user: req.user.id,

            profileImage: profileImage || "",
            headline: headline || "",
            bio: bio || "",

            categories: categories || [],

            skills: skills || [],

            experience: Number(experience) || 0,

            experienceLevel:
                experienceLevel || "FRESHER",

            currentCompany:
                currentCompany || "",

            currentSalary:
                Number(currentSalary) || 0,

            expectedSalary: {
                min: Number(expectedSalary?.min) || 0,
                max: Number(expectedSalary?.max) || 0,
            },

            preferredJobTitle:
                preferredJobTitle || [],

            preferredLocations:
                preferredLocations || [],

            resume: resume || "",
            portfolio: portfolio || "",
            linkedin: linkedin || "",
            github: github || "",

            availability:
                availability || "IMMEDIATELY",

            isOpenToWork:
                isOpenToWork !== undefined
                    ? isOpenToWork
                    : true,
        });

        const populatedCandidate =
            await CandidateProfile.findById(candidate._id)
                .populate(
                    "categories",
                    "name slug description"
                );

        return res.status(201).json({
            success: true,
            message: "Candidate profile created successfully",
            data: populatedCandidate,
        });

    } catch (error) {
        console.error("createCandidate error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create candidate profile",
            error: error.message,
        });
    }
};