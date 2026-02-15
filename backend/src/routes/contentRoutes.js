const express = require("express");
const {
  getHomeContent,
  getHomeContentForAdmin,
  updateHomeSection,
  uploadHomeLogo
} = require("../controllers/contentController");
const { requireAuth, requirePasswordChangeCompleted } = require("../middleware/authMiddleware");
const { allowRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/home", getHomeContent);
router.get("/admin/home", requireAuth, requirePasswordChangeCompleted, allowRoles("admin", "super_admin"), getHomeContentForAdmin);
router.put(
  "/admin/home/:sectionId",
  requireAuth,
  requirePasswordChangeCompleted,
  allowRoles("admin", "super_admin"),
  updateHomeSection
);
router.post(
  "/admin/home/logo",
  requireAuth,
  requirePasswordChangeCompleted,
  allowRoles("admin", "super_admin"),
  uploadHomeLogo
);

module.exports = router;

