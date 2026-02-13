const express = require("express");
const {
  createCourse,
  enrollInCourse,
  getMyCourses,
  saveZoomLink
} = require("../controllers/courseController");
const { requireAuth, requirePasswordChangeCompleted } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadRecording } = require("../controllers/videoController");

const router = express.Router();

router.post("/", requireAuth, requirePasswordChangeCompleted, allowRoles("admin"), createCourse);
router.post("/:courseId/enroll", requireAuth, requirePasswordChangeCompleted, allowRoles("student"), enrollInCourse);
router.get("/my", requireAuth, requirePasswordChangeCompleted, getMyCourses);
router.post(
  "/:courseId/live-sessions",
  requireAuth,
  requirePasswordChangeCompleted,
  allowRoles("admin", "teacher"),
  saveZoomLink
);
router.post(
  "/:courseId/recordings",
  requireAuth,
  requirePasswordChangeCompleted,
  allowRoles("admin", "teacher"),
  uploadRecording
);

module.exports = router;
