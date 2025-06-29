import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  if (!videoId?.trim()) {
    throw new ApiError(400, "Video Not Found");
  }
  if (!content) {
    throw new ApiError(400, "Comment cannot be empty");
  }
  const user = req.user;

  const comment = await Comment.create({
    content,
    owner: user,
    video: videoId,
  });

  if (!comment) {
    throw new ApiError(400, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  if (!commentId?.trim()) {
    throw new ApiError(400, "comment not found");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(400, "Something Went Wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment Updated Successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId?.trim()) {
    throw new ApiError(400, "Comment Not Found");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError("Something went Wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment deleted successfully"));
});

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //   const { page = 1, limit = 10 } = req.query;
  if (!videoId?.trim()) {
    throw new ApiError(400, "Video Not Found");
  }
  const comments = await Comment.find({ video: videoId });
  if (!comments) {
    throw new ApiError(400, "Something went wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});
export { addComment, updateComment, deleteComment, getVideoComments };
