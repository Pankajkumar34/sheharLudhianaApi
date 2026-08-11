const express = require("express");

const router = express.Router();

const jobsController= require("../jobs/jobs.controller");

router.post( "/create",jobsController.createJobType);

router.get( "/list",jobsController.getJobTypes);

module.exports = router;