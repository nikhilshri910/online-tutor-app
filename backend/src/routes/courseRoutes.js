const express = require("express");
const {
  createCourse,
  enrollInCourse,
  getMyCourses,
  saveZoomLink
} = require("../controllers/courseController");
const { requireAuth } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { uploadRecording } = require("../controllers/videoController");

const router = express.Router();

router.post("/", requireAuth, allowRoles("admin"), createCourse);
router.post("/:courseId/enroll", requireAuth, allowRoles("student"), enrollInCourse);
router.get("/my", requireAuth, getMyCourses);
router.post("/:courseId/live-sessions", requireAuth, allowRoles("admin", "teacher"), saveZoomLink);
router.post("/:courseId/recordings", requireAuth, allowRoles("admin", "teacher"), uploadRecording);

module.exports = router;
