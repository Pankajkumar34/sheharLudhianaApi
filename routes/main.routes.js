const express = require('express');
const router = express.Router();
router.use("/auth",require("../src/modules/auth/auth.routes"))
router.use("/user",require("../src/modules/user/user.routes"))
router.use("/category",require("../src/modules/category/category.routes"))
router.use("/file",require("../src/modules/fileUpload/fileUpload.routes"))
router.use("/business",require("../src/modules/business/business.routes"))

module.exports = router;