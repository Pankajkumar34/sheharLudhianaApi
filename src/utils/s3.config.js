const { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require("dotenv").config()
const s3Client = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});




async function getUploadURL(fileName, fileType) {
  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME,
    Key: `uploads/${fileName}`,
    ContentType: fileType
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 300 });
}
const deleteFromS3 = async (fileUrl) => {
  try {
    if (!fileUrl) throw new Error("fileUrl is required");

    let key;
    if (fileUrl.startsWith("http")) {
      const url = new URL(fileUrl);
      key = decodeURIComponent(url.pathname.substring(1)); 
    } else {
      key = fileUrl;
    }


    const command = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: key, 
    });

    await s3Client.send(command);

    return true;
  } catch (err) {
    console.error("S3 delete error:", err);
    throw err; 
  }
};

const deleteMultipleFromS3 = async (urls) => {

    const objects = urls.map(url => ({
        Key: new URL(url).pathname.substring(1)
    }));


    const command = new DeleteObjectsCommand({
        Bucket: process.env.BUCKET_NAME,
        Delete: {
            Objects: objects
        }
    });


    return await s3Client.send(command);
};
module.exports = { getUploadURL,deleteMultipleFromS3, deleteFromS3 }