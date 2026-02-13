const { pool } = require("../config/db");
const { createNotificationsForUsers } = require("../services/notificationService");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function createHomeworkTask(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const { subject, title, description, dueDate, studentIds } = req.body;

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    if (!isNonEmptyString(subject) || !isNonEmptyString(title)) {
      return res.status(400).json({ message: "subject and title are required" });
    }

    const [courseRows] = await pool.query("SELECT id, title, teacher_id FROM courses WHERE id = ? LIMIT 1", [courseId]);
    if (!courseRows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    const course = courseRows[0];
    if (req.user.role === "teacher" && course.teacher_id !== req.user.id) {
      return res.status(403).json({ message: "You can only assign tasks for your own courses" });
    }

    const effectiveTeacherId = req.user.role === "teacher" ? req.user.id : course.teacher_id;

    const [taskResult] = await pool.query(
      "INSERT INTO homework_tasks (course_id, teacher_id, subject, title, description, due_date) VALUES (?, ?, ?, ?, ?, ?)",
      [
        courseId,
        effectiveTeacherId,
        subject.trim(),
        title.trim(),
        isNonEmptyString(description) ? description.trim() : null,
        dueDate || null
      ]
    );

    let targetStudentRows = [];
    if (Array.isArray(studentIds) && studentIds.length) {
      const ids = studentIds.map((id) => Number(id)).filter((id) => Number.isInteger(id));
      if (!ids.length) {
        return res.status(400).json({ message: "studentIds must contain integer values" });
      }

      const placeholders = ids.map(() => "?").join(",");
      const [rows] = await pool.query(
        `SELECT e.student_id
         FROM enrollments e
         WHERE e.course_id = ? AND e.student_id IN (${placeholders})`,
        [courseId, ...ids]
      );
      targetStudentRows = rows;
    } else {
      const [rows] = await pool.query("SELECT student_id FROM enrollments WHERE course_id = ?", [courseId]);
      targetStudentRows = rows;
    }

    for (const row of targetStudentRows) {
      await pool.query("INSERT INTO homework_assignments (task_id, student_id) VALUES (?, ?)", [taskResult.insertId, row.student_id]);
    }

    await createNotificationsForUsers({
      userIds: targetStudentRows.map((row) => row.student_id),
      type: "homework",
      title: `New homework: ${title.trim()}`,
      message: `New homework assigned in ${course.title}`,
      data: { taskId: taskResult.insertId, courseId, dueDate: dueDate || null }
    });

    return res.status(201).json({
      message: "Homework task assigned",
      task: {
        id: taskResult.insertId,
        courseId,
        subject: subject.trim(),
        title: title.trim(),
        dueDate: dueDate || null,
        assignedCount: targetStudentRows.length
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function getTeacherDashboard(req, res, next) {
  try {
    const isTeacher = req.user.role === "teacher";
    const whereClause = isTeacher ? "WHERE c.teacher_id = ?" : "";
    const params = isTeacher ? [req.user.id] : [];

    const [courses] = await pool.query(
      `SELECT c.id, c.title, c.description, c.teacher_id, u.name AS teacher_name
       FROM courses c
       JOIN users u ON u.id = c.teacher_id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );

    if (!courses.length) {
      return res.json({
        stats: {
          totalCourses: 0,
          totalTasks: 0,
          pendingSubmissions: 0,
          submittedAssignments: 0,
          scheduledClasses: 0
        },
        courses: [],
        tasks: [],
        submissions: [],
        schedule: [],
        previousLectures: []
      });
    }

    const courseIds = courses.map((item) => item.id);
    const placeholders = courseIds.map(() => "?").join(",");

    const [taskRows] = await pool.query(
      `SELECT ht.id, ht.course_id, ht.subject, ht.title, ht.description, ht.due_date, ht.created_at,
              c.title AS course_title,
              COUNT(ha.id) AS assigned_count,
              SUM(CASE WHEN ha.status = 'submitted' THEN 1 ELSE 0 END) AS submitted_count
       FROM homework_tasks ht
       JOIN courses c ON c.id = ht.course_id
       LEFT JOIN homework_assignments ha ON ha.task_id = ht.id
       WHERE ht.course_id IN (${placeholders})
       GROUP BY ht.id
       ORDER BY ht.created_at DESC`,
      courseIds
    );

    const [submissionRows] = await pool.query(
      `SELECT ha.id AS assignment_id, ha.task_id, ha.status, ha.submission_text, ha.submitted_at,
              ht.title AS task_title, ht.subject, c.title AS course_title,
              u.id AS student_id, u.name AS student_name, u.email AS student_email
       FROM homework_assignments ha
       JOIN homework_tasks ht ON ht.id = ha.task_id
       JOIN courses c ON c.id = ht.course_id
       JOIN users u ON u.id = ha.student_id
       WHERE ht.course_id IN (${placeholders})
       ORDER BY ha.submitted_at DESC, ha.created_at DESC`,
      courseIds
    );

    const [scheduleRows] = await pool.query(
      `SELECT ls.id, ls.course_id, ls.topic, ls.zoom_join_url, ls.start_time, c.title AS course_title
       FROM live_sessions ls
       JOIN courses c ON c.id = ls.course_id
       WHERE ls.course_id IN (${placeholders})
       ORDER BY ls.start_time DESC`,
      courseIds
    );

    const [recordingRows] = await pool.query(
      `SELECT r.id, r.course_id, r.title, r.embed_url, c.title AS subject
       FROM recordings r
       JOIN courses c ON c.id = r.course_id
       WHERE r.course_id IN (${placeholders})
       ORDER BY r.created_at DESC`,
      courseIds
    );

    const tasks = taskRows.map((item) => {
      const assignedCount = Number(item.assigned_count || 0);
      const submittedCount = Number(item.submitted_count || 0);
      return {
        id: item.id,
        courseId: item.course_id,
        courseTitle: item.course_title,
        subject: item.subject,
        title: item.title,
        description: item.description,
        dueDate: item.due_date,
        createdAt: item.created_at,
        assignedCount,
        submittedCount,
        pendingCount: assignedCount - submittedCount
      };
    });

    const submissions = submissionRows.map((item) => ({
      assignmentId: item.assignment_id,
      taskId: item.task_id,
      taskTitle: item.task_title,
      subject: item.subject,
      courseTitle: item.course_title,
      status: item.status,
      submissionText: item.submission_text,
      submittedAt: item.submitted_at,
      student: {
        id: item.student_id,
        name: item.student_name,
        email: item.student_email
      }
    }));

    const schedule = scheduleRows.map((item) => ({
      id: item.id,
      courseId: item.course_id,
      topic: item.topic,
      startTime: item.start_time,
      joinUrl: item.zoom_join_url,
      subject: item.course_title
    }));

    const previousLectures = recordingRows.map((item) => ({
      id: item.id,
      courseId: item.course_id,
      title: item.title,
      embedUrl: item.embed_url,
      subject: item.subject
    }));

    const stats = {
      totalCourses: courses.length,
      totalTasks: tasks.length,
      pendingSubmissions: tasks.reduce((acc, item) => acc + item.pendingCount, 0),
      submittedAssignments: submissions.filter((item) => item.status === "submitted").length,
      scheduledClasses: schedule.length
    };

    return res.json({
      stats,
      courses,
      tasks,
      submissions,
      schedule,
      previousLectures
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createHomeworkTask,
  getTeacherDashboard
};
