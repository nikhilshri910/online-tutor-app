const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const env = require("./config/env");
const { pool, testDbConnection } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const zoomRoutes = require("./routes/zoomRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const contentRoutes = require("./routes/contentRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/health", async (_req, res, next) => {
  try {
    await testDbConnection();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    next(err);
  }
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/zoom", zoomRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/content", contentRoutes);

app.use(errorHandler);

async function ensureSchemaUpdates() {
  await pool.query(
    "ALTER TABLE users MODIFY COLUMN role ENUM('super_admin', 'admin', 'teacher', 'student') NOT NULL"
  );

  const [rows] = await pool.query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'users'
       AND COLUMN_NAME = 'must_change_password'
     LIMIT 1`
  );

  if (!rows.length) {
    await pool.query("ALTER TABLE users ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0");
  }

  await pool.query(
    `CREATE TABLE IF NOT EXISTS site_contents (
      content_key VARCHAR(64) PRIMARY KEY,
      content_json JSON NOT NULL,
      updated_by INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_site_contents_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
    )`
  );
}

async function startServer() {
  await ensureSchemaUpdates();

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
