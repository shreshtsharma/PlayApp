import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }
  try {
    const status = await Subscription.findOne({
      subscriber: userId,
      channel: channelId,
    });

    if (status) {
      await status.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, {}, "channel unsubscribed successfully"));
    } else {
      const member = await Subscription.create({
        subscriber: userId,
        channel: channelId,
      });
      return res
        .status(200)
        .json(new ApiResponse(201, member, "channel subscribed successfully"));
    }
  } catch (error) {
    throw new ApiError(500, "An error occured while toggling subscription");
  }
});

// controller to return subscriber list of a channel

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel Id is invalid");
  }
  try {
    const subscribers = await Subscription.find({
      channel: channelId,
    }).populate("subscriber");

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "subscribers fetched successfully")
      );
  } catch (error) {
    throw new ApiError(401, "something went wrong while fetching subscribers");
  }
});

// controller to return channel list to which user has subscribed

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "subscriber id is invalid");
  }

  try {
    const subscribedChannels = await Subscription.find({
      subscriber: subscriberId,
    }).populate("channel");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribedChannels,
          "subscribed channels fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      "something went wrong while fetching subscribed channels"
    );
  }
});
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
