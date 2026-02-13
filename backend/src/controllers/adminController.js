const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { uploadToVimeoFromUrl } = require("../services/vimeoService");
const { createNotificationsForUsers } = require("../services/notificationService");

const allowedRoles = ["admin", "teacher", "student"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function ensureGroupExists(groupId) {
  const [rows] = await pool.query("SELECT id, name FROM student_groups WHERE id = ? LIMIT 1", [groupId]);
  return rows[0] || null;
}

async function ensureUserExists(userId) {
  const [rows] = await pool.query("SELECT id, role FROM users WHERE id = ? LIMIT 1", [userId]);
  return rows[0] || null;
}

async function ensureGroupSessionExists(groupId, sessionId) {
  const [rows] = await pool.query(
    "SELECT id, group_id FROM group_live_sessions WHERE id = ? AND group_id = ? LIMIT 1",
    [sessionId, groupId]
  );
  return rows[0] || null;
}

async function ensureGroupRecordingExists(groupId, recordingId) {
  const [rows] = await pool.query(
    "SELECT id, group_id FROM group_recordings WHERE id = ? AND group_id = ? LIMIT 1",
    [recordingId, groupId]
  );
  return rows[0] || null;
}

async function listUsers(_req, res, next) {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
    );

    return res.json({ users: rows });
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!isNonEmptyString(name) || !isNonEmptyString(email) || !isNonEmptyString(password)) {
      return res.status(400).json({ message: "name, email and password are required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "role must be admin, teacher, or student" });
    }

    if (password.trim().length < 8) {
      return res.status(400).json({ message: "password must be at least 8 characters" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name.trim(), normalizedEmail, passwordHash, role]
    );

    return res.status(201).json({
      message: "User created",
      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role
      }
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);
    const { name, email, password, role } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
      return res.status(400).json({ message: "name and email are required" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "role must be admin, teacher, or student" });
    }

    const existingUser = await ensureUserExists(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const updateParts = ["name = ?", "email = ?", "role = ?"];
    const params = [name.trim(), normalizedEmail, role];

    if (isNonEmptyString(password)) {
      if (password.trim().length < 8) {
        return res.status(400).json({ message: "password must be at least 8 characters" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      updateParts.push("password_hash = ?");
      params.push(passwordHash);
    }

    params.push(userId);

    await pool.query(`UPDATE users SET ${updateParts.join(", ")} WHERE id = ?`, params);

    return res.json({
      message: "User updated",
      user: {
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role
      }
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email already exists" });
    }

    return next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = Number(req.params.userId);

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (req.user.id === userId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const existingUser = await ensureUserExists(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE id = ?", [userId]);
    return res.json({ message: "User deleted" });
  } catch (err) {
    return next(err);
  }
}

async function createGroup(req, res, next) {
  try {
    const { name, description, includeAllStudents } = req.body;

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const [result] = await pool.query(
      "INSERT INTO student_groups (name, description, created_by) VALUES (?, ?, ?)",
      [name.trim(), isNonEmptyString(description) ? description.trim() : null, req.user.id]
    );

    if (includeAllStudents) {
      await pool.query(
        `INSERT IGNORE INTO group_members (group_id, student_id)
         SELECT ?, id FROM users WHERE role = 'student'`,
        [result.insertId]
      );
    }

    return res.status(201).json({
      message: "Group created",
      group: {
        id: result.insertId,
        name: name.trim(),
        description: isNonEmptyString(description) ? description.trim() : null,
        includeAllStudents: Boolean(includeAllStudents)
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function updateGroup(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const { name, description } = req.body;

    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    if (!isNonEmptyString(name)) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const group = await ensureGroupExists(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await pool.query("UPDATE student_groups SET name = ?, description = ? WHERE id = ?", [
      name.trim(),
      isNonEmptyString(description) ? description.trim() : null,
      groupId
    ]);

    return res.json({
      message: "Group updated",
      group: {
        id: groupId,
        name: name.trim(),
        description: isNonEmptyString(description) ? description.trim() : null
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteGroup(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);

    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    const group = await ensureGroupExists(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await pool.query("DELETE FROM student_groups WHERE id = ?", [groupId]);
    return res.json({ message: "Group deleted" });
  } catch (err) {
    return next(err);
  }
}

async function addStudentsToGroup(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const { studentIds, includeAllStudents } = req.body;

    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    const group = await ensureGroupExists(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (includeAllStudents) {
      await pool.query(
        `INSERT IGNORE INTO group_members (group_id, student_id)
         SELECT ?, id FROM users WHERE role = 'student'`,
        [groupId]
      );

      return res.json({ message: "All students added to group" });
    }

    if (!Array.isArray(studentIds) || !studentIds.length) {
      return res.status(400).json({ message: "studentIds is required when includeAllStudents is false" });
    }

    const ids = studentIds.map((id) => Number(id)).filter((id) => Number.isInteger(id));

    if (!ids.length) {
      return res.status(400).json({ message: "studentIds must contain valid integer IDs" });
    }

    const placeholders = ids.map(() => "?").join(",");
    const [students] = await pool.query(
      `SELECT id FROM users WHERE role = 'student' AND id IN (${placeholders})`,
      ids
    );

    if (!students.length) {
      return res.status(400).json({ message: "No valid student IDs found" });
    }

    for (const student of students) {
      await pool.query("INSERT IGNORE INTO group_members (group_id, student_id) VALUES (?, ?)", [groupId, student.id]);
    }

    return res.json({ message: "Students added to group", addedCount: students.length });
  } catch (err) {
    return next(err);
  }
}

async function listGroups(_req, res, next) {
  try {
    const [groups] = await pool.query(
      `SELECT g.id, g.name, g.description, g.created_at,
              COUNT(DISTINCT gm.student_id) AS student_count
       FROM student_groups g
       LEFT JOIN group_members gm ON gm.group_id = g.id
       GROUP BY g.id
       ORDER BY g.created_at DESC`
    );

    if (!groups.length) {
      return res.json({ groups: [] });
    }

    const groupIds = groups.map((group) => group.id);
    const placeholders = groupIds.map(() => "?").join(",");

    const [sessions] = await pool.query(
      `SELECT id, group_id, topic, zoom_join_url, start_time
       FROM group_live_sessions
       WHERE group_id IN (${placeholders})
       ORDER BY created_at DESC`,
      groupIds
    );

    const [recordings] = await pool.query(
      `SELECT id, group_id, title, vimeo_video_id, embed_url
       FROM group_recordings
       WHERE group_id IN (${placeholders})
       ORDER BY created_at DESC`,
      groupIds
    );

    const groupMap = new Map();
    for (const group of groups) {
      const { student_count, ...groupWithoutCount } = group;
      groupMap.set(group.id, {
        ...groupWithoutCount,
        studentCount: Number(group.student_count || 0),
        sessions: [],
        recordings: []
      });
    }

    for (const session of sessions) {
      const group = groupMap.get(session.group_id);
      if (group) {
        group.sessions.push({
          id: session.id,
          topic: session.topic,
          zoomJoinUrl: session.zoom_join_url,
          startTime: session.start_time
        });
      }
    }

    for (const recording of recordings) {
      const group = groupMap.get(recording.group_id);
      if (group) {
        group.recordings.push({
          id: recording.id,
          title: recording.title,
          vimeoVideoId: recording.vimeo_video_id,
          embedUrl: recording.embed_url
        });
      }
    }

    return res.json({ groups: Array.from(groupMap.values()) });
  } catch (err) {
    return next(err);
  }
}

async function createGroupLiveSession(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const { topic, zoomJoinUrl, startTime } = req.body;

    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    if (!isNonEmptyString(topic) || !isNonEmptyString(zoomJoinUrl)) {
      return res.status(400).json({ message: "topic and zoomJoinUrl are required" });
    }

    const group = await ensureGroupExists(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const [result] = await pool.query(
      "INSERT INTO group_live_sessions (group_id, topic, zoom_join_url, start_time) VALUES (?, ?, ?, ?)",
      [groupId, topic.trim(), zoomJoinUrl.trim(), startTime || null]
    );

    const [memberRows] = await pool.query("SELECT student_id FROM group_members WHERE group_id = ?", [groupId]);
    await createNotificationsForUsers({
      userIds: memberRows.map((row) => row.student_id),
      type: "group_live_class",
      title: `Group class scheduled: ${topic.trim()}`,
      message: `A group live class has been scheduled.`,
      data: { groupId, sessionId: result.insertId, zoomJoinUrl: zoomJoinUrl.trim(), startTime: startTime || null }
    });

    return res.status(201).json({
      message: "Group live session created",
      session: {
        id: result.insertId,
        groupId,
        topic: topic.trim(),
        zoomJoinUrl: zoomJoinUrl.trim(),
        startTime: startTime || null
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function updateGroupLiveSession(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const sessionId = Number(req.params.sessionId);
    const { topic, zoomJoinUrl, startTime } = req.body;

    if (!Number.isInteger(groupId) || !Number.isInteger(sessionId)) {
      return res.status(400).json({ message: "Invalid groupId or sessionId" });
    }

    if (!isNonEmptyString(topic) || !isNonEmptyString(zoomJoinUrl)) {
      return res.status(400).json({ message: "topic and zoomJoinUrl are required" });
    }

    const session = await ensureGroupSessionExists(groupId, sessionId);
    if (!session) {
      return res.status(404).json({ message: "Group live session not found" });
    }

    await pool.query(
      "UPDATE group_live_sessions SET topic = ?, zoom_join_url = ?, start_time = ? WHERE id = ? AND group_id = ?",
      [topic.trim(), zoomJoinUrl.trim(), startTime || null, sessionId, groupId]
    );

    return res.json({
      message: "Group live session updated",
      session: {
        id: sessionId,
        groupId,
        topic: topic.trim(),
        zoomJoinUrl: zoomJoinUrl.trim(),
        startTime: startTime || null
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteGroupLiveSession(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const sessionId = Number(req.params.sessionId);

    if (!Number.isInteger(groupId) || !Number.isInteger(sessionId)) {
      return res.status(400).json({ message: "Invalid groupId or sessionId" });
    }

    const session = await ensureGroupSessionExists(groupId, sessionId);
    if (!session) {
      return res.status(404).json({ message: "Group live session not found" });
    }

    await pool.query("DELETE FROM group_live_sessions WHERE id = ? AND group_id = ?", [sessionId, groupId]);
    return res.json({ message: "Group live session deleted" });
  } catch (err) {
    return next(err);
  }
}

async function createGroupRecording(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const { title, sourceVideoUrl } = req.body;

    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ message: "Invalid groupId" });
    }

    if (!isNonEmptyString(title) || !isNonEmptyString(sourceVideoUrl)) {
      return res.status(400).json({ message: "title and sourceVideoUrl are required" });
    }

    const group = await ensureGroupExists(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const { vimeoVideoId, embedUrl } = await uploadToVimeoFromUrl(sourceVideoUrl.trim(), title.trim());

    if (!vimeoVideoId || !embedUrl) {
      return res.status(502).json({ message: "Vimeo did not return a usable video id" });
    }

    const [result] = await pool.query(
      "INSERT INTO group_recordings (group_id, title, vimeo_video_id, embed_url) VALUES (?, ?, ?, ?)",
      [groupId, title.trim(), vimeoVideoId, embedUrl]
    );

    return res.status(201).json({
      message: "Group recording created",
      recording: {
        id: result.insertId,
        groupId,
        title: title.trim(),
        vimeoVideoId,
        embedUrl
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function updateGroupRecording(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const recordingId = Number(req.params.recordingId);
    const { title, sourceVideoUrl } = req.body;

    if (!Number.isInteger(groupId) || !Number.isInteger(recordingId)) {
      return res.status(400).json({ message: "Invalid groupId or recordingId" });
    }

    if (!isNonEmptyString(title)) {
      return res.status(400).json({ message: "title is required" });
    }

    const recording = await ensureGroupRecordingExists(groupId, recordingId);
    if (!recording) {
      return res.status(404).json({ message: "Group recording not found" });
    }

    let vimeoVideoId = null;
    let embedUrl = null;

    if (isNonEmptyString(sourceVideoUrl)) {
      const uploadResult = await uploadToVimeoFromUrl(sourceVideoUrl.trim(), title.trim());
      vimeoVideoId = uploadResult.vimeoVideoId;
      embedUrl = uploadResult.embedUrl;

      if (!vimeoVideoId || !embedUrl) {
        return res.status(502).json({ message: "Vimeo did not return a usable video id" });
      }

      await pool.query(
        "UPDATE group_recordings SET title = ?, vimeo_video_id = ?, embed_url = ? WHERE id = ? AND group_id = ?",
        [title.trim(), vimeoVideoId, embedUrl, recordingId, groupId]
      );
    } else {
      await pool.query("UPDATE group_recordings SET title = ? WHERE id = ? AND group_id = ?", [
        title.trim(),
        recordingId,
        groupId
      ]);

      const [rows] = await pool.query(
        "SELECT vimeo_video_id, embed_url FROM group_recordings WHERE id = ? AND group_id = ? LIMIT 1",
        [recordingId, groupId]
      );
      vimeoVideoId = rows[0]?.vimeo_video_id || null;
      embedUrl = rows[0]?.embed_url || null;
    }

    return res.json({
      message: "Group recording updated",
      recording: {
        id: recordingId,
        groupId,
        title: title.trim(),
        vimeoVideoId,
        embedUrl
      }
    });
  } catch (err) {
    return next(err);
  }
}

async function deleteGroupRecording(req, res, next) {
  try {
    const groupId = Number(req.params.groupId);
    const recordingId = Number(req.params.recordingId);

    if (!Number.isInteger(groupId) || !Number.isInteger(recordingId)) {
      return res.status(400).json({ message: "Invalid groupId or recordingId" });
    }

    const recording = await ensureGroupRecordingExists(groupId, recordingId);
    if (!recording) {
      return res.status(404).json({ message: "Group recording not found" });
    }

    await pool.query("DELETE FROM group_recordings WHERE id = ? AND group_id = ?", [recordingId, groupId]);
    return res.json({ message: "Group recording deleted" });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  addStudentsToGroup,
  createGroupLiveSession,
  updateGroupLiveSession,
  deleteGroupLiveSession,
  createGroupRecording,
  updateGroupRecording,
  deleteGroupRecording
};
