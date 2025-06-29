import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
// import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  // we'll check if the user is login through verifyJWT middleware and we'll attach it during routing
  // then we'll take the user from req beacuse it was attached with the request after authentication
  // then we'll also take content from request which user wants to tweet
  // and create a tweet in tweet collection.
  // Finally we'll return the response if tweet created successfully
  const user = req.user;
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const { content } = req.body;

  const tweet = await Tweet.create({
    content,
    owner: user,
  });
  if (!tweet) {
    throw new ApiError(400, "Something Went Wrong!!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  // we'll check if user is login via verifyJWT middleware
  // if user is login then we'll get the tweet id from req
  // then we'll delete the tweet from DB and return the reponse
  const { tweetId } = req.params;
  if (!tweetId?.trim()) {
    throw new ApiError(400, "Tweet not found!!");
  }
  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
  if (!deletedTweet) {
    throw new ApiError(400, "tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet Deleted Successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId?.trim()) {
    throw new ApiError(400, "Tweet Not Found!!");
  }
  const { content } = req.body;
  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { content },
    { new: true }
  );
  if (!updatedTweet) {
    throw new ApiError(400, "Tweet not found!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet Updated Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId?.trim()) {
    throw new ApiError(400, "User Not Found");
  }
  const userTweets = await Tweet.find({ owner: userId });
  if (!userTweets || userTweets.length < 1) {
    throw new ApiError(400, "Tweets Not Found!!");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, userTweets, "Tweets Fetched Successfully"));
});

export { createTweet, deleteTweet, updateTweet, getUserTweets };
