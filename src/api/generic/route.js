import { Router } from "express";
import { upload } from "../../utils/multer";
import { uploadFile, uploadFiles } from "./controller";

export const genericRouter = Router();

genericRouter.post("/upload", upload.single("image"), uploadFile);
genericRouter.post("/upload-images", upload.array("images"), uploadFiles);
