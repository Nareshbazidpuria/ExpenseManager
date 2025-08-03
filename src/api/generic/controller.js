import { badReq, handleExceptions, rm } from "../../utils/common";

export const uploadFile = handleExceptions(async (req, res) => {
  if (req.file) {
    return rm(res, "File uploaded", {
      path: req.file.path?.replace("public", ""),
    });
  }
  return badReq(res, "File not uploaded");
});

export const uploadFiles = handleExceptions(async (req, res) => {
  if (req.mimetypeError)
    return badReq(res, "Only png, jpg and jpeg images are allowed");
  if (req.files?.length) {
    return rm(
      res,
      "Files uploaded",
      req.files.map((f) => f.path.replace("public", ""))
    );
  }
  return badReq(res, "Files not uploaded");
});
