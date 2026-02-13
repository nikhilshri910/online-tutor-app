const { pool } = require("../config/db");

async function getStudentPortal(req, res, next) {
  try {
    const studentId = req.user.id;

    const [taskRows] = await pool.query(
      `SELECT ha.id AS assignment_id, ha.status, ha.submission_text, ha.submitted_at,
              ht.id AS task_id, ht.subject, ht.title, ht.description, ht.due_date,
              c.id AS course_id, c.title AS course_title, u.name AS teacher_name
       FROM homework_assignments ha
       JOIN homework_tasks ht ON ht.id = ha.task_id
       JOIN courses c ON c.id = ht.course_id
       JOIN users u ON u.id = ht.teacher_id
       WHERE ha.student_id = ?
       ORDER BY ht.due_date IS NULL, ht.due_date ASC, ht.created_at DESC`,
      [studentId]
    );

    const [courseSessionRows] = await pool.query(
      `SELECT ls.id, ls.topic, ls.zoom_join_url, ls.start_time, c.id AS course_id, c.title AS course_title
       FROM live_sessions ls
       JOIN courses c ON c.id = ls.course_id
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.student_id = ?
       ORDER BY ls.start_time DESC`,
      [studentId]
    );

    const [groupSessionRows] = await pool.query(
      `SELECT gls.id, gls.topic, gls.zoom_join_url, gls.start_time, sg.id AS group_id, sg.name AS group_name
       FROM group_live_sessions gls
       JOIN student_groups sg ON sg.id = gls.group_id
       JOIN group_members gm ON gm.group_id = sg.id
       WHERE gm.student_id = ?
       ORDER BY gls.start_time DESC`,
      [studentId]
    );

    const [courseRecordingRows] = await pool.query(
      `SELECT r.id, r.title, r.embed_url, c.id AS course_id, c.title AS subject
       FROM recordings r
       JOIN courses c ON c.id = r.course_id
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.student_id = ?
       ORDER BY r.created_at DESC`,
      [studentId]
    );

    const [groupRecordingRows] = await pool.query(
      `SELECT gr.id, gr.title, gr.embed_url, sg.id AS group_id, sg.name AS subject
       FROM group_recordings gr
       JOIN student_groups sg ON sg.id = gr.group_id
       JOIN group_members gm ON gm.group_id = sg.id
       WHERE gm.student_id = ?
       ORDER BY gr.created_at DESC`,
      [studentId]
    );

    const [notificationRows] = await pool.query(
      `SELECT id, type, title, message, is_read, data_json, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [studentId]
    );

    const tasks = taskRows.map((row) => ({
      assignmentId: row.assignment_id,
      taskId: row.task_id,
      status: row.status,
      submissionText: row.submission_text,
      submittedAt: row.submitted_at,
      subject: row.subject,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      courseId: row.course_id,
      courseTitle: row.course_title,
      teacherName: row.teacher_name
    }));

    const schedule = [
      ...courseSessionRows.map((row) => ({
        id: `course-${row.id}`,
        source: "course",
        topic: row.topic,
        startTime: row.start_time,
        joinUrl: row.zoom_join_url,
        subject: row.course_title
      })),
      ...groupSessionRows.map((row) => ({
        id: `group-${row.id}`,
        source: "group",
        topic: row.topic,
        startTime: row.start_time,
        joinUrl: row.zoom_join_url,
        subject: row.group_name
      }))
    ].sort((a, b) => new Date(b.startTime || 0) - new Date(a.startTime || 0));

    const previousLectures = [
      ...courseRecordingRows.map((row) => ({
        id: `course-${row.id}`,
        title: row.title,
        embedUrl: row.embed_url,
        subject: row.subject,
        source: "course"
      })),
      ...groupRecordingRows.map((row) => ({
        id: `group-${row.id}`,
        title: row.title,
        embedUrl: row.embed_url,
        subject: row.subject,
        source: "group"
      }))
    ];

    const notifications = notificationRows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: Boolean(row.is_read),
      data: row.data_json,
      createdAt: row.created_at
    }));

    return res.json({
      tasks,
      schedule,
      previousLectures,
      notifications
    });
  } catch (err) {
    return next(err);
  }
}

async function submitHomework(req, res, next) {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const { submissionText } = req.body;

    if (!Number.isInteger(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignmentId" });
    }

    if (typeof submissionText !== "string" || !submissionText.trim()) {
      return res.status(400).json({ message: "submissionText is required" });
    }

    const [rows] = await pool.query(
      "SELECT id FROM homework_assignments WHERE id = ? AND student_id = ? LIMIT 1",
      [assignmentId, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await pool.query(
      "UPDATE homework_assignments SET status = 'submitted', submission_text = ?, submitted_at = NOW() WHERE id = ? AND student_id = ?",
      [submissionText.trim(), assignmentId, req.user.id]
    );

    return res.json({ message: "Homework submitted" });
  } catch (err) {
    return next(err);
  }
}

async function markNotificationRead(req, res, next) {
  try {
    const notificationId = Number(req.params.notificationId);

    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({ message: "Invalid notificationId" });
    }

    await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
      notificationId,
      req.user.id
    ]);

    return res.json({ message: "Notification marked as read" });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getStudentPortal,
  submitHomework,
  markNotificationRead
};
