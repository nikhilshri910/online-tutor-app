const bcrypt = require("bcryptjs");
const env = require("../config/env");
const { pool } = require("../config/db");
const { signAuthToken } = require("../services/jwtService");

function validateLoginInput(body) {
  if (!body.email || !body.password) {
    return "Email and password are required";
  }

  if (typeof body.email !== "string" || typeof body.password !== "string") {
    return "Email and password must be strings";
  }

  return null;
}

function setAuthCookie(res, token) {
  res.cookie(env.jwt.cookieName, token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000
  });
}

function clearAuthCookie(res) {
  res.clearCookie(env.jwt.cookieName, {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  });
}

async function login(req, res, next) {
  try {
    const message = validateLoginInput(req.body);
    if (message) {
      return res.status(400).json({ message });
    }

    const { email, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const passwordMatched = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatched) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    return next(err);
  }
}

function logout(_req, res) {
  clearAuthCookie(res);
  res.json({ message: "Logout successful" });
}

async function me(req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  logout,
  me
};
