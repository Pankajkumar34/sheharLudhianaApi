const router = require("express").Router();
const {authenticate} = require("../../middleware/auhtentication")
const eventsController = require("./events.controller")

router.post("/create-events",authenticate,eventsController.createEvent)





// web
router.get("/list",eventsController.getEvents)
module.exports = router;