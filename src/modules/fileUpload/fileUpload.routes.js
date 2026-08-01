


const router = require("express").Router();
const { authenticate } = require("../../middleware/auhtentication")
const fileUpload = require("../../helpers/fileUploader")
const { getUploadURL, deleteFromS3 } = require("../../utils/s3.config")



router.post("/get-s3-url", async (req, res) => {
    try {
        const { fileName, contentType } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ error: "fileName and contentType are required" });
        }
        const uploadUrl = await getUploadURL(fileName, contentType);
       return res.status(200).json({status: "success",  uploadUrl });
    } catch (error) {
        console.error("S3 URL Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// Express route to delete S3 file
router.post("/delete-s3-file", async (req, res) => {
  const { url } = req.body;

  try {
   const data= await deleteFromS3(url);
   return res.json({ success: true,data, message: "Deleted from S3 and DB" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get("/get-s3-file", async (req, res) => {
  const { url } = req.body;

  try {
    //  await model.homepageModel.updateOne(
    //   { "banner.image": url },
    //   { $pull: { banner: { image: url } } }
    // );

   return res.json({ success: true, message: "Deleted from S3 and DB" });
  } catch (err) {
   return res.status(500).json({ success: false, error: err.message });
  }
});
router.post("/upload", async (req, res) => {
    try {
        const files = req.files.images
        if (!Array.isArray(files)) {
            return res.status(400).json({ status: false, message: "File required" })
        }

        const fileUrl = await fileUpload(files)

        return res.status(201).json({ status: true, data: fileUrl })
    } catch (error) {
        res.status(500).json({ status: false, message: error.message })
    }
})
module.exports = router;





