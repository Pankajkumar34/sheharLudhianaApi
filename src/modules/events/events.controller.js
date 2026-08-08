
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
    } = req.body;

    const userId = req.user.id; // verifyToken middleware

    if (!title || !description || !eventDate || !startTime || !venue) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, event date, start time and venue are required.",
      });
    }

    const event = await eventsModel.create({
      userId,
      title: title.trim(),
      description: description.trim(),
      imageUrl: req.file?.location || "",
      eventDate,
      startTime,
      endTime: endTime || "",
      venue: venue.trim(),
      address: address || "",
      district: district || "",
      state: state || "",
      pincode: pincode || "",
      latitude: latitude || null,
      longitude: longitude || null,
      eventType: eventType || "OTHER",
      maxParticipants: maxParticipants || 0,
      registrationRequired: registrationRequired || false,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      event,
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};