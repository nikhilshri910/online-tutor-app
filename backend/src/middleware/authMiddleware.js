const env = require("../config/env");
const { verifyAuthToken } = require("../services/jwtService");

function requireAuth(req, res, next) {
  const token = req.cookies?.[env.jwt.cookieName];

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    req.user = verifyAuthToken(token);
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
