const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentsToGroup,
  createGroupLiveSession,
  updateGroupLiveSession,
  deleteGroupLiveSession,
  createGroupRecording,
  updateGroupRecording,
  deleteGroupRecording
} = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, allowRoles("admin"));

router.get("/users", listUsers);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

router.get("/groups", listGroups);
router.post("/groups", createGroup);
router.put("/groups/:groupId", updateGroup);
router.delete("/groups/:groupId", deleteGroup);
router.post("/groups/:groupId/students", addStudentsToGroup);
router.post("/groups/:groupId/live-sessions", createGroupLiveSession);
router.put("/groups/:groupId/live-sessions/:sessionId", updateGroupLiveSession);
router.delete("/groups/:groupId/live-sessions/:sessionId", deleteGroupLiveSession);
router.post("/groups/:groupId/recordings", createGroupRecording);
router.put("/groups/:groupId/recordings/:recordingId", updateGroupRecording);
router.delete("/groups/:groupId/recordings/:recordingId", deleteGroupRecording);

module.exports = router;
