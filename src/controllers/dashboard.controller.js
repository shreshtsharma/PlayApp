import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;
  const stats = {};

  //   get total views
  const totalViews = await Video.aggregate([
    {
      // getting all the videos where owner is user
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
      //   now grouping all those videos
    },
    {
      $group: {
        _id: null,
        views: { $sum: "$views" },
      },
    },
  ]);
  stats.totalViews = totalViews[0]?.views || 0;

  //   get total subscribers
  const totalSubs = await Subscription.countDocuments({ channel: userId });
  stats.totalSubs = totalSubs;
  //   get total videos,
  const totalVideos = await Video.countDocuments({ owner: userId });
  stats.totalVideos = totalVideos;
  //   get total likes
  const totalLikes = await Video.aggregate([
    {
      // This filters the Video documents to only include those created by the user with userId.
      $match: {
        owner: userId,
      },
    },
    // This joins each video (from the previous stage) with documents from the likes collection.
    // The matching Like documents are put in an array called LikesSum inside each video object.
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "LikesSum",
      },
    },
    // count likes of each video
    {
      $project: {
        likeCount: { $size: "$LikesSum" },
      },
    },
    // group all video objects and add the number of likes of each video
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$likeCount" },
      },
    },
  ]);

  stats.totalLikes = totalLikes[0]?.totalLikes || 0;

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "stats fetched successfully"));
});
const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user._id;
  const allVideos = await Video.find({ owner: userId });
  return res
    .status(200)
    .json(new ApiResponse(200, allVideos, "all videos uploaded by the user"));
});

export { getChannelStats, getChannelVideos };
