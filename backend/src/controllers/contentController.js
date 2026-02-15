const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const { pool } = require("../config/db");
const { DEFAULT_HOME_CONTENT } = require("../config/defaultHomeContent");

const HOME_CONTENT_KEY = "home_page";

function toJson(value) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_err) {
      return null;
    }
  }

  return value || null;
}

function normalizeContent(content) {
  const source = content && typeof content === "object" ? content : {};
  return {
    ...DEFAULT_HOME_CONTENT,
    ...source,
    appMeta: {
      ...DEFAULT_HOME_CONTENT.appMeta,
      ...(source.appMeta || {})
    }
  };
}

function validateSectionPayload(sectionId, payload) {
  if (!payload || typeof payload !== "object") {
    return "Payload must be an object";
  }

  if (sectionId === "branding" && (!payload.title || typeof payload.title !== "string")) {
    return "Brand title is required";
  }

  return null;
}

async function ensureDefaultHomeContent() {
  const [rows] = await pool.query(
    "SELECT content_json, updated_at FROM site_contents WHERE content_key = ? LIMIT 1",
    [HOME_CONTENT_KEY]
  );

  if (rows.length) {
    const content = normalizeContent(toJson(rows[0].content_json));
    return {
      content,
      updatedAt: rows[0].updated_at
    };
  }

  await pool.query("INSERT INTO site_contents (content_key, content_json) VALUES (?, ?)", [
    HOME_CONTENT_KEY,
    JSON.stringify(DEFAULT_HOME_CONTENT)
  ]);

  return { content: DEFAULT_HOME_CONTENT, updatedAt: null };
}

async function getHomeContent(_req, res, next) {
  try {
    const { content, updatedAt } = await ensureDefaultHomeContent();
    return res.json({ content, updatedAt });
  } catch (err) {
    return next(err);
  }
}

async function getHomeContentForAdmin(_req, res, next) {
  try {
    const { content, updatedAt } = await ensureDefaultHomeContent();
    return res.json({ content, updatedAt });
  } catch (err) {
    return next(err);
  }
}

async function saveContent(content, userId) {
  await pool.query(
    `INSERT INTO site_contents (content_key, content_json, updated_by)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE content_json = VALUES(content_json), updated_by = VALUES(updated_by)`,
    [HOME_CONTENT_KEY, JSON.stringify(content), userId]
  );

  const [rows] = await pool.query(
    "SELECT updated_at FROM site_contents WHERE content_key = ? LIMIT 1",
    [HOME_CONTENT_KEY]
  );

  return rows[0]?.updated_at || null;
}

function applySectionUpdate(content, sectionId, payload) {
  const next = normalizeContent(content);

  if (sectionId === "branding") {
    next.appMeta = {
      ...next.appMeta,
      title: String(payload.title || "").trim(),
      logoUrl: String(payload.logoUrl || "").trim()
    };
    return next;
  }

  const editableSections = new Set([
    "hero",
    "programs",
    "comparison",
    "problemSolution",
    "flipSteps",
    "professionals",
    "outcomes",
    "journeys",
    "enquiry",
    "faq",
    "footer"
  ]);

  if (!editableSections.has(sectionId)) {
    return null;
  }

  next[sectionId] = payload;
  return next;
}

async function updateHomeSection(req, res, next) {
  try {
    const sectionId = String(req.params.sectionId || "").trim();
    const { payload } = req.body || {};
    const validationError = validateSectionPayload(sectionId, payload);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const { content } = await ensureDefaultHomeContent();
    const next = applySectionUpdate(content, sectionId, payload);
    if (!next) {
      return res.status(404).json({ message: "Unknown sectionId" });
    }

    const updatedAt = await saveContent(next, req.user.id);

    return res.json({
      message: "Section updated",
      sectionId,
      section: sectionId === "branding" ? next.appMeta : next[sectionId],
      updatedAt
    });
  } catch (err) {
    return next(err);
  }
}

async function uploadHomeLogo(req, res, next) {
  try {
    const { fileName, mimeType, dataBase64 } = req.body || {};
    if (!fileName || !mimeType || !dataBase64) {
      return res.status(400).json({ message: "fileName, mimeType and dataBase64 are required" });
    }

    const mimeToExt = {
      "image/png": ".png",
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/webp": ".webp",
      "image/svg+xml": ".svg"
    };

    const ext = mimeToExt[mimeType];
    if (!ext) {
      return res.status(400).json({ message: "Unsupported image type" });
    }

    const uploadsDir = path.resolve(__dirname, "../../uploads");
    await fs.mkdir(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${randomUUID()}${ext}`;
    const filePath = path.join(uploadsDir, safeName);
    const buffer = Buffer.from(String(dataBase64), "base64");
    await fs.writeFile(filePath, buffer);

    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/${safeName}`;
    const { content } = await ensureDefaultHomeContent();
    const next = normalizeContent(content);
    next.appMeta = { ...next.appMeta, logoUrl };
    const updatedAt = await saveContent(next, req.user.id);

    return res.json({
      message: "Logo uploaded",
      logoUrl,
      updatedAt
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getHomeContent,
  getHomeContentForAdmin,
  updateHomeSection,
  uploadHomeLogo
};

