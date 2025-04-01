import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
// coniguration for when we recieve data in the form of forms
// we can also limit it like how much data we can store

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// routes declaration

// we are calling route directly till now using app.get because route and function executing are there
// but now we have route and controller in different file so we have to use middleware now and app.use()
app.use("/api/v1/users", userRouter);

// https://localHost:8000/api/V1/users/register

export { app };
