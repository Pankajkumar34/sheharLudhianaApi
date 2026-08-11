
const eventsModel = require("./events.model");

exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      venue,
      address,
      district,
      state,
      pincode,
      latitude,
      longitude,
      eventType,
      maxParticipants,
      registrationRequired,
      chiefGuest,
      imageUrl
    } = req.body;

    const userId = req.user.id;


    if (
      !title ||
      !description ||
      !eventDate ||
      !startTime ||
      !venue
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, event date, start time and venue are required.",
      });
    }


    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required.",
      });
    }

    if (lat < -90 || lat > 90) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude.",
      });
    }

    if (lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude.",
      });
    }


    let parsedChiefGuest = [];

    if (chiefGuest) {
      try {
        parsedChiefGuest =
          typeof chiefGuest === "string"
            ? JSON.parse(chiefGuest)
            : chiefGuest;

        if (!Array.isArray(parsedChiefGuest)) {
          parsedChiefGuest = [];
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid chiefGuest format.",
        });
      }
    }


  

   

    const event = await eventsModel.create({
      userId,

      title: title.trim(),

      description: description.trim(),

      chiefGuest: parsedChiefGuest,

      imageUrl,

      eventDate,

      startTime,

      endTime: endTime || "",

      venue: venue.trim(),

      address: address?.trim() || "",

      district: district?.trim() || "",

      state: state?.trim() || "",

      pincode: pincode?.trim() || "",

      // IMPORTANT:
      // GeoJSON = [longitude, latitude]
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },

      eventType: eventType || "OTHER",

      maxParticipants:
        Number(maxParticipants) || 0,

      registrationRequired:
        registrationRequired === true ||
        registrationRequired === "true",

      status: "UPCOMING",

      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    console.error(
      "Create Event Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
      error: error.message,
    });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const {
      search,
      eventType,
      district,
      state,
      pincode,
      registrationRequired,
      startDate,
      endDate,
      longitude,
      latitude,
      radius = 5,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // ================================
    // SEARCH
    // ================================

    if (search) {
      filter.$or = [
        {
          title: {
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
          venue: {
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
      ];
    }

    // ================================
    // EVENT TYPE
    // ================================

    if (eventType) {
      filter.eventType = eventType;
    }

    // ================================
    // LOCATION FILTERS
    // ================================

    if (district) {
      filter.district = {
        $regex: district,
        $options: "i",
      };
    }

    if (state) {
      filter.state = {
        $regex: state,
        $options: "i",
      };
    }

    if (pincode) {
      filter.pincode = pincode;
    }

    // ================================
    // REGISTRATION REQUIRED
    // ================================

    if (registrationRequired !== undefined) {
      filter.registrationRequired =
        registrationRequired === "true";
    }

    // ================================
    // DATE FILTER
    // ================================

    if (startDate || endDate) {
      filter.eventDate = {};

      if (startDate) {
        filter.eventDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const date = new Date(endDate);

        date.setHours(23, 59, 59, 999);

        filter.eventDate.$lte = date;
      }
    }

    // ================================
    // PAGINATION
    // ================================

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

    // ================================
    // LOCATION BASED SEARCH
    // ================================

    let events;
    let total;

    if (longitude && latitude) {
      const lng = Number(longitude);
      const lat = Number(latitude);
      const radiusInMeters =
        Number(radius) * 1000;

      if (
        !Number.isFinite(lng) ||
        !Number.isFinite(lat) ||
        lng < -180 ||
        lng > 180 ||
        lat < -90 ||
        lat > 90
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid location",
        });
      }

      // MongoDB $geoNear must be first stage
      const pipeline = [
        {
          $geoNear: {
            near: {
              type: "Point",
              coordinates: [lng, lat],
            },
            key: "location",
            distanceField: "distance",
            maxDistance: radiusInMeters,
            spherical: true,
            query: filter,
          },
        },

        {
          $sort: {
            distance: 1,
          },
        },

        {
          $skip: skip,
        },

        {
          $limit: limitNumber,
        },
      ];

      events = await eventsModel.aggregate(
        pipeline
      );

      total = await eventsModel.countDocuments({
        ...filter,
        location: {
          $geoWithin: {
            $centerSphere: [
              [lng, lat],
              radiusInMeters / 6378100,
            ],
          },
        },
      });
    } else {
      // ================================
      // NORMAL EVENT LIST
      // ================================

      [events, total] =
        await Promise.all([
          eventsModel.find(filter)
            .sort({
              eventDate: 1,
              startTime: 1,
            })
            .skip(skip)
            .limit(limitNumber)
            .lean(),

          eventsModel.countDocuments(filter),
        ]);
    }

    return res.status(200).json({
      success: true,

      data: events,

      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(
          total / limitNumber
        ),
        hasNextPage:
          pageNumber <
          Math.ceil(total / limitNumber),
        hasPrevPage:
          pageNumber > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get events error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
};