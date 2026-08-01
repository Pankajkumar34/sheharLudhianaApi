const router = require("express").Router();
const userController = require("./user.controller")
const {authenticate} = require("../../middleware/auhtentication")
router.post("/complete-profile", authenticate, userController.completeProfile)
module.exports = router;