import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
      { title: { $regex: query, options: "i" } },
      { description: { $regex: query, options: "i" } },
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

  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
});

export { getAllVideos };
