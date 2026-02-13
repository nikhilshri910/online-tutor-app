const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const { testDbConnection } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const zoomRoutes = require("./routes/zoomRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
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

app.get("/health", async (_req, res, next) => {
  try {
    await testDbConnection();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/zoom", zoomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Backend running on http://localhost:${env.port}`);
});
