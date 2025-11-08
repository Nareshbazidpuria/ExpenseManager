import { badReq, handleExceptions, rm } from "../../utils/common";
import { uploadToCloudinary } from "../../utils/multer";

export const uploadFile = handleExceptions(async (req, res) => {
  if (req.mimetypeError) return badReq(res, "Only png, jpg and jpeg images are allowed");

  if (req.file) {
    // return rm(res, "File uploaded", {
    //   path: req.file.path?.replace("public", ""),
    // });

    const { error, result } = await uploadToCloudinary(req.file.buffer, "ExpenseManager/Bills");
    if (error) return badReq(res, "File upload failed to cloud");
    return rm(res, "File uploaded", { path: result.secure_url });
  }
  return badReq(res, "File not uploaded");
});

export const uploadFiles = handleExceptions(async (req, res) => {
  if (req.mimetypeError) return badReq(res, "Only png, jpg and jpeg images are allowed");
  // if (req.files?.length) {
  //   return rm(
  //     res,
  //     "Files uploaded",
  //     req.files.map((f) => f.path.replace("public", ""))
  //   );
  // }
  if (req.files?.length) {
    const uploadResults = await Promise.all(req.files.map((file) => uploadToCloudinary(file.buffer, "ExpenseManager/Bills")));

    const failedUploads = uploadResults.filter(({ error }) => error);
    if (failedUploads.length > 0) return badReq(res, "Some files failed to upload to cloud");

    const filePaths = uploadResults.map(({ result }) => result.secure_url);
    return rm(res, "Files uploaded", filePaths);
  }
  return badReq(res, "Files not uploaded");
});
