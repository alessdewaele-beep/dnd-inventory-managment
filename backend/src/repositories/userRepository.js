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

  async getAll() {
    const [rows] = await pool.query("SELECT * FROM users");
    return rows;
  }
}
module.exports = new UserRepository();
