import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;
  if (!name || !description) {
    throw new ApiError(400, "All fields are required");
  }
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const playlist = Playlist.create({
    name,
    description,
    owner: user,
  });
  if (!playlist) {
    throw new ApiError(400, "Something Went Wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!userId?.trim()) {
    throw new ApiError(400, "user not found");
  }

  const userPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  if (!userPlaylists) {
    throw new ApiError(400, "Playlists not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "playlists fetched successfully")
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId?.trim()) {
    throw new ApiError(400, "something went wrong");
  }
  const list = await Playlist.findById(playlistId);
  if (!list) {
    throw new ApiError(400, "playlist not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, list, "playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId?.trim() || !videoId?.trim()) {
    throw new ApiError(400, "playlist or video not found");
  }
  const updatedList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );
  if (!updatedList) {
    throw new ApiError(400, "Something Went Wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedList, "video added Successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId?.trim() || !videoId?.trim()) {
    throw new ApiError(400, "playlist or video not found");
  }
  const updatedList = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        videos: videoId,
      },
    },
    {
      new: true,
    }
  );
  if (!updatedList) {
    throw new ApiError(400, "Something Went Wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedList, "video removed Successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId?.trim()) {
    throw new ApiError(400, "playlist not found");
  }
  const updatedList = await Playlist.findByIdAndDelete(playlistId);
  if (!updatedList) {
    throw new ApiError(400, "Something Went Wrong");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist removed Successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId?.trim()) {
    throw new ApiError(400, "Playlist not found");
  }

  if (!name && !description) {
    throw new ApiError(
      400,
      "At least one field (name or description) is required to update"
    );
  }

  const updateObj = {};
  if (name) updateObj.name = name;
  if (description) updateObj.description = description;

  const updatedList = await Playlist.findByIdAndUpdate(playlistId, updateObj, {
    new: true,
  });

  if (!updatedList) {
    throw new ApiError(400, "Something Went Wrong");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedList, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
