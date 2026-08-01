const router = require("express").Router();
const {authenticate} = require("../../middleware/auhtentication")
const categoriesController = require("./category.controller")

router.get("/get-categories",categoriesController.getCategoriesList)
module.exports = router;