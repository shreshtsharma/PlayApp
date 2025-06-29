import { Router } from "express";
import {
  getAllVideos,
  getVideoById,
  updateVideo,
  togglePublishStatus,
  deleteVideo,
  publishAVideo,
  incrementViews,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      {
        name: "video",
        maxcount: 1,
      },
      {
        name: "thumbnail",
        maxcount: 1,
      },
    ]),
    publishAVideo
  );

router
  .route("/:videoId")
  .get(getVideoById)
  .patch(upload.single("thumbnail"), updateVideo)
  .delete(deleteVideo);

router.route("/views/:videoId").patch(incrementViews);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export default router;
