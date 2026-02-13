const { pool } = require("../config/db");
const { uploadToVimeoFromUrl } = require("../services/vimeoService");

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function uploadRecording(req, res, next) {
  try {
    const courseId = Number(req.params.courseId);
    const { title, sourceVideoUrl } = req.body;

    if (!Number.isInteger(courseId)) {
      return res.status(400).json({ message: "Invalid courseId" });
    }

    if (!isNonEmptyString(title) || !isNonEmptyString(sourceVideoUrl)) {
      return res.status(400).json({ message: "title and sourceVideoUrl are required" });
    }

    const [courseRows] = await pool.query("SELECT id FROM courses WHERE id = ? LIMIT 1", [courseId]);
    if (!courseRows.length) {
      return res.status(404).json({ message: "Course not found" });
    }

    const { vimeoVideoId, embedUrl } = await uploadToVimeoFromUrl(sourceVideoUrl.trim(), title.trim());

    if (!vimeoVideoId || !embedUrl) {
      return res.status(502).json({ message: "Vimeo did not return a usable video id" });
    }

    const [result] = await pool.query(
      "INSERT INTO recordings (course_id, title, vimeo_video_id, embed_url) VALUES (?, ?, ?, ?)",
      [courseId, title.trim(), vimeoVideoId, embedUrl]
    );

    return res.status(201).json({
      message: "Recording uploaded",
      recording: {
        id: result.insertId,
        courseId,
        title: title.trim(),
        vimeoVideoId,
        embedUrl
      }
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  uploadRecording
};
