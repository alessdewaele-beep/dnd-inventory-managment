const pool = require("../database");
const bcrypt = require("bcrypt");

class UserRepository {
  async createUser(user) {
    const hash = await bcrypt.hash(user.password, 10);
    const role = user.role || "Player";
    const [result] = await pool.query(
      "INSERT INTO users (username, password_hash, role, campaign_id) VALUES (?, ?, ?, ?)",
      [user.username, hash, role, user.campaignId]
    );
    return {
      id: result.insertId,
      username: user.username,
      campaignId: user.campaignId,
    };
  }

  async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  async findById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  async getByCampaignId(campaignId) {
    const [rows] = await pool.query(
      "SELECT id, username, role, campaign_id FROM users WHERE campaign_id = ?",
      [campaignId]
    );
    return rows;
  }

  // Bewust zonder password_hash: deze lijst gaat naar de admin-client.
  async getAll() {
    const [rows] = await pool.query(
      "SELECT id, username, role, campaign_id, created_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  }

  async deleteById(id) {
    const user = await this.findById(id);
    if (!user) return null;
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return { id: user.id, username: user.username };
  }

  // Dynamische update; enkel de meegegeven kolommen (bv. role, campaign_id).
  async update(id, data) {
    const fields = [];
    const values = [];
    for (const key in data) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);

    const [result] = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return null;
    return this.findById(id);
  }

  async updatePassword(id, password) {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hash, id]
    );
    return result.affectedRows > 0;
  }

  async countAll() {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM users");
    return rows[0].total;
  }

  async countByRole() {
    const [rows] = await pool.query(
      "SELECT role, COUNT(*) AS count FROM users GROUP BY role"
    );
    return rows;
  }

  async getRecent(limit = 5) {
    const [rows] = await pool.query(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC LIMIT ?",
      [Number(limit)]
    );
    return rows;
  }
}
module.exports = new UserRepository();
