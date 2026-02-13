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
      "SELECT id, name, email, password_hash, role, must_change_password FROM users WHERE email = ? LIMIT 1",
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
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: Boolean(user.must_change_password)
      }
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
      "SELECT id, name, email, role, must_change_password FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
        mustChangePassword: Boolean(rows[0].must_change_password)
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body || {};

    if (typeof newPassword !== "string") {
      return res.status(400).json({ message: "newPassword is required" });
    }

    if (newPassword.trim().length < 8) {
      return res.status(400).json({ message: "newPassword must be at least 8 characters" });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, role, password_hash, must_change_password FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const mustChangePassword = Boolean(user.must_change_password);

    if (!mustChangePassword) {
      if (typeof currentPassword !== "string" || !currentPassword.trim()) {
        return res.status(400).json({ message: "currentPassword is required" });
      }

      const currentPasswordMatched = await bcrypt.compare(currentPassword, user.password_hash);

      if (!currentPasswordMatched) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }
    }

    const samePassword = await bcrypt.compare(newPassword, user.password_hash);
    if (samePassword) {
      return res.status(400).json({ message: "New password must be different from current password" });
    }

    const nextPasswordHash = await bcrypt.hash(newPassword.trim(), 10);
    await pool.query("UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?", [
      nextPasswordHash,
      user.id
    ]);

    const token = signAuthToken({ id: user.id, email: user.email, role: user.role });
    setAuthCookie(res, token);

    return res.json({
      message: "Password changed successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mustChangePassword: false
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  login,
  logout,
  me,
  changePassword
};
