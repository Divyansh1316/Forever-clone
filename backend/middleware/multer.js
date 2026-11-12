import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 4,
    fields: 10,
    parts: 14,
    fieldNameSize: 100,
    fieldNestingDepth: 1,
    fieldArrayIndexLimit: 10,
  },
  fileFilter(_req, file, callback) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
    }
    callback(null, true);
  },
});

export default upload;
