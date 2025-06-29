import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  // 1. Extract Query Parameters
  // 2. Build Filter Object for querying database with requested fields
  // 3. Build Sort Object
  // 4. Implement Pagination
  // 5. Query The Database
  // 6.Get Total Count
  // 7.Send response

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId) {
    filter.owner = userId;
  }

  // making a sort object;
  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sort = { createdAt: -1 };
  }

  // skip these many results from response relative to the page
  const skip = (page - 1) * limit;

  // Querying the database
  try {
    const videos = await Video.find(filter).sort(sort).skip(skip).limit(limit);
    const totalDocuments = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments) / limit;
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { videos, totalDocuments, totalPages },
          "Videos fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(400, "Something Went Wrong");
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  // steps
  // 1.apply the multer middleware we  have made during routing
  // 2.get the files local path
  // 3.if files local path is there then we upload the file/video on cloudinary
  // 4.we get back the cloudinary url after uploading it to cloudinary
  // 5.and then we'll create a object with title,description,user,and video url in the database
  // 6.we'll return the video object created

  const user = req.user;
  const { title, description } = req.body;

  // TODO: get video, upload to cloudinary, create video
  const videoFileLocalPath = req.files?.video[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  if (!videoFileLocalPath || !thumbnailLocalPath || !title || !description) {
    throw new ApiError(400, "All fields are mandatory!!");
  }

  const uploadedVideoPath = await uploadOnCloudinary(videoFileLocalPath);
  const uploadedThumbnailPath = await uploadOnCloudinary(thumbnailLocalPath);

  if (!uploadedThumbnailPath || !uploadedVideoPath) {
    throw new ApiError(
      400,
      "Something Went Wrong While Uploading files to cloudinary"
    );
  }
  const publishedVideo = await Video.create({
    title,
    description,
    owner: user,
    thumbnail: uploadedThumbnailPath.url,
    videoFile: uploadedVideoPath.url,
    duration: uploadedVideoPath.duration,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, publishedVideo, "Video Object Created successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(400, "Not Available");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video Fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  // 1.receive title,description and thumbnail from request
  // 2.check if the fields are present
  // 3.check if thumbnail uploaded to storage memory correctly
  // 4.upload thumbnail to cloudinary
  // 5.search video by id from Video collection in mongodb
  // 6.get previous thumbnail url from video document
  // 7.delete previous thumbnail from cloudinary
  // 8.update the video object with whatever field user is trying to update

  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid Video Id");
  }
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  let uploadedThumbnailPath;
  const updatedData = {};

  if (thumbnailLocalPath) {
    uploadedThumbnailPath = await uploadOnCloudinary(thumbnailLocalPath);

    if (!uploadedThumbnailPath) {
      throw new ApiError(400, "Something went wrong while Uploading");
    }
  }

  if (title?.trim() != "") {
    updatedData.title = title;
  }
  if (description?.trim() != "") {
    updatedData.description = description;
  }

  if (uploadedThumbnailPath) {
    updatedData.thumbnail = uploadedThumbnailPath.url;
  }
  // deleting old thumbnail
  if (uploadedThumbnailPath) {
    const video = await Video.findById(videoId);
    const oldThumbnail = video.thumbnail;
    await deleteFromCloudinary(oldThumbnail);
  }
  const updatedVideo = await Video.findByIdAndUpdate(videoId, updatedData, {
    new: true,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid Video Id");
  }
  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(401, "something went wrong while deleting video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video Deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  // First, fetch the current video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Toggle the ispublished status
  video.isPublished = !video.isPublished;
  const updatedStatus = await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedStatus, "Status toggled successfully"));
});

const incrementViews = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Object Id");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!video) {
    throw new ApiError(400, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, video, "views updated successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  incrementViews,
};
