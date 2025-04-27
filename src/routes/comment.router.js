import { Router } from "express";
import {
  addComment,
  updateComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
