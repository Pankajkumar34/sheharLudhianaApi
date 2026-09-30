const express = require("express");

const router = express.Router();
const {authenticate} = require("../../middleware/auhtentication")

const jobsController= require("../jobs/jobs.controller");

router.post( "/create",authenticate,jobsController.createJobCategory);
router.get( "/category/get-list",authenticate,jobsController.getJobCategories);
router.get( "/categoryById/:id",authenticate,jobsController.getJobCategoryById);
router.delete( "/delete-category/:id",authenticate,jobsController.deleteJobCategory);
router.put("/update-category/:id",authenticate,jobsController.updateJobCategory)

router.post("/create-company",authenticate,jobsController.createCompany)
router.get("/get-company-list",authenticate,jobsController.getCompanies)
router.put("/update-company/:id",authenticate,jobsController.updateCompany)
router.get("/get-companyById/:id",authenticate,jobsController.getCompanyById)
router.delete("/delete-company/:id",authenticate,jobsController.deleteCompany)





module.exports = router;