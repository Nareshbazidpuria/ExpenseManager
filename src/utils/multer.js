import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

const storageEngine = multer.diskStorage({
  destination: "./public/images",
  filename: (_, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer();

// export const upload = multer({
//   storage: storageEngine,
//   // limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (_, file, cb) => {
//     if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       req.mimetypeError = true;
//       cb(null, false);
//     }
//   },
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer, folder) =>
  new Promise((resolve) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => resolve({ error, result }));
    streamifier.createReadStream(buffer).pipe(stream);
  });
