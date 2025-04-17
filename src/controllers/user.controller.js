import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // giving refresh token to user
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // steps for registering a user
  // Get user details from frontend
  // validate user input like not empty
  // check if user already exists
  // check for images,and avatar
  // upload them to cloudinary
  // create user object in database
  // remove password and refresh token field from response
  // check for user creation
  // return response if success else return error

  const { fullname, username, password, email } = req.body;

  console.log("email :", email);

  // validation if fields are empty or not
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // check for images,and avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // check to find if coverImage is uploaded else continue
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage[0].length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }
  // console.log(avatarLocalPath);

  // if (avatarLocalPath) {
  //   console.log("avatar local uploaded Successfully");
  // }

  // upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // if (avatar) {
  //   console.log("uploaded on cloudinary successfully");
  // }
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user object in database
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  // checking if user is created or not and removing password and refreshToken from response
  // if (user) {
  //   console.log("user created successfully");
  // }
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    console.log("user not created");

    throw new ApiError(500, "Someting went wrong while registering the user");
  }
  if (createdUser) {
    console.log("User created successfully");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // First take input data from req->body {username/email, password}
  // then find the user in database and match the encrypted password in database
  // if user found and password matched then generate a access token and refresh token
  // then send the access token and refresh token to user
  // Send secure cookie
  // give the access to resources for user and log him in and give a response like user loged in successfully

  const { username, email, password } = req.body;

  console.log(username);

  if (!username && !email) {
    console.log("required");

    throw new ApiError(404, "username or email is required");
  }

  if (!password) {
    throw new ApiError(404, "password is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(
      401,
      "User not found !! Please register before logging in "
    );
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "username or password is not correct");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Userlogged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // get the refresh token from browser who is requesting
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(201, "unauthorized request");
  }

  // decode the refreshtoken received
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // now get the user who is requesting this with the help of decoded token
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid Refresh Token");
    }

    // now match the refresh token of user from database and the newrefresh token which browser sent.
    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // now if the refresh token matched then generate new access token and refresh token and give it to user
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens();

    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
