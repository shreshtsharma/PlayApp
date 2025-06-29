import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on video

  if (!isValidObjectId(videoId)) {
    return new ApiError(400, "Invalid video id type");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked successfully"));
  } else {
    const newLike = await Like.create({ video: videoId, likedBy: userId });
    if (newLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "video liked successfully"));
    } else {
      throw new ApiError(400, "Something Went Wrong");
    }
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  //TODO: toggle like on comment
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "invalid comment id type");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unliked successfully"));
  } else {
    const newLike = await Like.create({ comment: commentId, likedBy: userId });
    if (newLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "comment liked successfully"));
    } else {
      throw new ApiError(400, "Something Went Wrong");
    }
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "invalid tweet id type");
  }
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet unliked successfully"));
  } else {
    const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
    if (newLike) {
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "tweet liked successfully"));
    } else {
      throw new ApiError(400, "Something Went Wrong");
    }
  }
});
const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const userId = req.user._id;
  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $ne: null },
  }).populate("video");

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "List of all video liked by user"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
