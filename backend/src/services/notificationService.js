const { pool } = require("../config/db");

async function createNotificationsForUsers({ userIds, type, title, message, data = null }) {
  const validIds = Array.from(new Set((userIds || []).filter((id) => Number.isInteger(id))));
  if (!validIds.length) {
    return;
  }

  const jsonPayload = data ? JSON.stringify(data) : null;

  for (const userId of validIds) {
    await pool.query(
      "INSERT INTO notifications (user_id, type, title, message, data_json) VALUES (?, ?, ?, ?, ?)",
      [userId, type, title, message, jsonPayload]
    );
  }
}

module.exports = {
  createNotificationsForUsers
};


