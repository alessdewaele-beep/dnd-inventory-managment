const pool = require("../database");

class HpRepository {
  async getByUserId(userId) {
    const [rows] = await pool.query(
      "SELECT user_id, enabled, max_hp, current_hp, temp_hp FROM user_hp WHERE user_id = ?",
      [userId]
    );
    return rows[0] || null;
  }

  // One row per user: create or overwrite.
  async upsert(userId, hp) {
    await pool.query(
      `INSERT INTO user_hp (user_id, enabled, max_hp, current_hp, temp_hp)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         enabled = VALUES(enabled),
         max_hp = VALUES(max_hp),
         current_hp = VALUES(current_hp),
         temp_hp = VALUES(temp_hp)`,
      [userId, hp.enabled, hp.maxHp, hp.currentHp, hp.tempHp]
    );
    return this.getByUserId(userId);
  }
}

module.exports = new HpRepository();
