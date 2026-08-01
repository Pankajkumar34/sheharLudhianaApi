const fs = require("fs/promises");
const path = require("path");

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

const MAX_SIZE = 3 * 1024 * 1024;

const uploader = async (files, destination = "uploads") => {
  if (!Array.isArray(files)) {
    files = [files];
  }

  const uploadDir = path.join(process.cwd(), "public", destination);

  await fs.mkdir(uploadDir, { recursive: true });

  const uploadedFiles = [];

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new Error("Only JPG, JPEG, PNG and GIF files are allowed.");
    }

    if (file.size > MAX_SIZE) {
      throw new Error("Maximum file size is 3 MB.");
    }

    const ext = path.extname(file.name);

    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;

    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, file.data);

    uploadedFiles.push({
      originalName: file.name,
      fileName,
      url: `/${destination}/${fileName}`,
    });
  }

  return uploadedFiles;
};

module.exports = uploader;