const express = require("express");
const { requireAuth, requirePasswordChangeCompleted } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const { createHomeworkTask, getTeacherDashboard } = require("../controllers/teacherController");

const router = express.Router();

router.use(requireAuth, requirePasswordChangeCompleted, allowRoles("teacher", "admin", "super_admin"));

router.get("/dashboard", getTeacherDashboard);
router.post("/courses/:courseId/tasks", createHomeworkTask);

module.exports = router;
