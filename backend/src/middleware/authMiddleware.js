const env = require("../config/env");
const { pool } = require("../config/db");
const { verifyAuthToken } = require("../services/jwtService");

async function requireAuth(req, res, next) {
  const token = req.cookies?.[env.jwt.cookieName];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const tokenPayload = verifyAuthToken(token);
    const [rows] = await pool.query(
      "SELECT id, name, email, role, must_change_password FROM users WHERE id = ? LIMIT 1",
      [tokenPayload.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      mustChangePassword: Boolean(rows[0].must_change_password)
    };

    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requirePasswordChangeCompleted(req, res, next) {
  if (req.user?.mustChangePassword) {
    return res.status(403).json({
      message: "Password change required before accessing this resource",
      code: "PASSWORD_CHANGE_REQUIRED"
    });
  }

  return next();
}

module.exports = { requireAuth, requirePasswordChangeCompleted };
