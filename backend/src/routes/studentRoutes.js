const express = require("express");
const { requireAuth, requirePasswordChangeCompleted } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  getStudentPortal,
  submitHomework,
  markNotificationRead
} = require("../controllers/studentController");

const router = express.Router();

router.use(requireAuth, requirePasswordChangeCompleted, allowRoles("student"));

router.get("/portal", getStudentPortal);
router.post("/tasks/:assignmentId/submit", submitHomework);
router.put("/notifications/:notificationId/read", markNotificationRead);

module.exports = router;
