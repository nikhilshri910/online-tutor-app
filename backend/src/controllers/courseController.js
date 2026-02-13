const { pool } = require("../config/db");
const { createNotificationsForUsers } = require("../services/notificationService");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function createCourse(req, res, next) {
  try {
    const { title, description, teacherId } = req.body;

    if (!isNonEmptyString(title) || !isNonEmptyString(description)) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (!Number.isInteger(teacherId)) {
      return res.status(400).json({ message: "teacherId must be an integer" });
    }

    const [teacherRows] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'teacher' LIMIT 1",
      [teacherId]
    );

    if (!teacherRows.length) {
      return res.status(400).json({ message: "teacherId must belong to a teacher" });
    }

    const [result] = await pool.query(
      "INSERT INTO courses (title, description, teacher_id) VALUES (?, ?, ?)",
      [title.trim(), description.trim(), teacherId]
    );

    return res.status(201).json({
      message: "Course created",
      course: { id: result.insertId, title: title.trim(), description: description.trim(), teacherId }
    });
  } catch (err) {
    return next(err);
  }
}

async function enrollInCourse(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    const [courseRows] = await pool.query("SELECT id FROM courses WHERE id = ? LIMIT 1", [courseId]);
    if (!courseRows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    await pool.query(
      "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE student_id = student_id",
      [req.user.id, courseId]
    );

    return res.json({ message: "Enrolled successfully" });
  } catch (err) {
    return next(err);
  }
}

function mapCourses(baseRows, sessionRows, recordingRows) {
  const courseMap = new Map();

  for (const row of baseRows) {
    courseMap.set(row.id, {
      id: row.id,
      title: row.title,
      description: row.description,
      teacherId: row.teacher_id,
      teacherName: row.teacher_name,
      liveSessions: [],
      recordings: []
    });
  }

  for (const row of sessionRows) {
    const course = courseMap.get(row.course_id);
    if (course) {
      course.liveSessions.push({
        id: row.id,
        topic: row.topic,
        zoomJoinUrl: row.zoom_join_url,
        startTime: row.start_time
      });
    }
  }

  for (const row of recordingRows) {
    const course = courseMap.get(row.course_id);
    if (course) {
      course.recordings.push({
        id: row.id,
        title: row.title,
        vimeoVideoId: row.vimeo_video_id,
        embedUrl: row.embed_url
      });
    }
  }

  return Array.from(courseMap.values());
}

async function getMyCourses(req, res, next) {
  try {
    let baseRows = [];

    if (req.user.role === "teacher") {
      const [rows] = await pool.query(
        `SELECT c.id, c.title, c.description, c.teacher_id, u.name AS teacher_name
         FROM courses c
         JOIN users u ON u.id = c.teacher_id
         WHERE c.teacher_id = ?`,
        [req.user.id]
      );
      baseRows = rows;
    } else if (req.user.role === "student") {
      const [rows] = await pool.query(
        `SELECT c.id, c.title, c.description, c.teacher_id, u.name AS teacher_name
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         JOIN users u ON u.id = c.teacher_id
         WHERE e.student_id = ?`,
        [req.user.id]
      );
      baseRows = rows;
    } else {
      const [rows] = await pool.query(
        `SELECT c.id, c.title, c.description, c.teacher_id, u.name AS teacher_name
         FROM courses c
         JOIN users u ON u.id = c.teacher_id`
      );
      baseRows = rows;
    }

    if (!baseRows.length) {
      return res.json({ courses: [] });
    }

    const courseIds = baseRows.map((row) => row.id);
    const placeholders = courseIds.map(() => "?").join(",");

    const [sessionRows] = await pool.query(
      `SELECT id, course_id, topic, zoom_join_url, start_time
       FROM live_sessions
       WHERE course_id IN (${placeholders})`,
      courseIds
    );

    const [recordingRows] = await pool.query(
      `SELECT id, course_id, title, vimeo_video_id, embed_url
       FROM recordings
       WHERE course_id IN (${placeholders})`,
      courseIds
    );

    const courses = mapCourses(baseRows, sessionRows, recordingRows);
    return res.json({ courses });
  } catch (err) {
    return next(err);
  }
}

async function saveZoomLink(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const { topic, zoomJoinUrl, startTime } = req.body;

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    if (!isNonEmptyString(topic) || !isNonEmptyString(zoomJoinUrl)) {
      return res.status(400).json({ message: "topic and zoomJoinUrl are required" });
    }

    const [courseRows] = await pool.query("SELECT id FROM courses WHERE id = ? LIMIT 1", [courseId]);
    if (!courseRows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    const [result] = await pool.query(
      "INSERT INTO live_sessions (course_id, topic, zoom_join_url, start_time) VALUES (?, ?, ?, ?)",
      [courseId, topic.trim(), zoomJoinUrl.trim(), startTime || null]
    );

    const [studentRows] = await pool.query(
      "SELECT student_id FROM enrollments WHERE course_id = ?",
      [courseId]
    );
    await createNotificationsForUsers({
      userIds: studentRows.map((row) => row.student_id),
      type: "live_class",
      title: `Live class scheduled: ${topic.trim()}`,
      message: `Your class is scheduled. Join using the provided Zoom link.`,
      data: { courseId, liveSessionId: result.insertId, zoomJoinUrl: zoomJoinUrl.trim(), startTime: startTime || null }
    });

    return res.status(201).json({
      message: "Zoom link saved",
      liveSession: {
        id: result.insertId,
        courseId,
        topic: topic.trim(),
        zoomJoinUrl: zoomJoinUrl.trim(),
        startTime: startTime || null
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createCourse,
  enrollInCourse,
  getMyCourses,
  saveZoomLink
};
