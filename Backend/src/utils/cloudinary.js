import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfull
    //console.log("file is uploaded on cloudinary ", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  try {
    const public_id = getPublicId(url);
    await cloudinary.uploader.destroy(public_id);
  } catch {
    console.log("something went wrong while deleting");
  }
};
const getPublicId = (url) => {
  // Remove query params if any
  const cleanUrl = url.split("?")[0];

  // Get the part after /upload/
  const parts = cleanUrl.split("/upload/");
  if (parts.length < 2) return null;

  // Remove file extension
  const pathWithExtension = parts[1];
  const lastDotIndex = pathWithExtension.lastIndexOf(".");
  if (lastDotIndex === -1) return null;

  const publicId = pathWithExtension.substring(0, lastDotIndex);
  return publicId;
};

export { uploadOnCloudinary, deleteFromCloudinary };
