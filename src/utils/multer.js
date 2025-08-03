import multer from "multer";

const storageEngine = multer.diskStorage({
  destination: "./public/images",
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({
  storage: storageEngine,
  // limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      req.mimetypeError = true;
      cb(null, false);
    }
  },
});
