const express = require("express");
const { login, logout, me, changePassword } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", requireAuth, me);
router.post("/change-password", requireAuth, changePassword);

module.exports = router;
