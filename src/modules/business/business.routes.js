const router = require("express").Router();
const {authenticate} = require("../../middleware/auhtentication")
const businessController = require("./business.controller")

router.post("/create-business",authenticate,businessController.createBusiness)
router.get("/my-businesses",authenticate,businessController.myBusinesses);
router.get("/get-businessesByid/:id",businessController.getBusinessById);

router.get("/all",businessController.getAllBusinesses);

module.exports = router;