const pool = require("../database");

class NotificationRepository {
  async create({ userId, type, message }) {
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
      [userId, type, message]
    );
    return { id: result.insertId, userId, type, message, is_read: 0 };
  }

  // Bulk insert of the same notification for several recipients (e.g. a
  // shared-inventory event fanned out to every campaign member).
  async createMany(rows) {
    if (!rows.length) return;
    const values = rows.map((r) => [r.userId, r.type, r.message]);
    await pool.query(
      "INSERT INTO notifications (user_id, type, message) VALUES ?",
      [values]
    );
  }

  async getByUserId(userId, limit = 100) {
    const [rows] = await pool.query(
      `SELECT id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
      [userId, Number(limit)]
    );
    return rows;
  }

  async countUnread(userId) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
    return rows[0].total;
  }

  // Marks one notification read; scoped to the owner so nobody can flip
  // someone else's notifications.
  async markRead(id, userId) {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  async markAllRead(userId) {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE",
      [userId]
    );
  }
}

module.exports = new NotificationRepository();
