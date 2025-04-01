import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

//whenever route goes to register execute registerUser function

router.route("/register").post(registerUser);

export default router;
