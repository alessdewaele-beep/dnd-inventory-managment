const pool = require("../database");

const COINS = ["pp", "gp", "sp", "cp"];

class CurrencyRepository {
  async getByUserId(userId) {
    const [rows] = await pool.query(
      "SELECT user_id, pp, gp, sp, cp FROM currencies WHERE user_id = ?",
      [userId]
    );
    return rows[0] || null;
  }

  // Eén rij per gebruiker: aanmaken of overschrijven.
  async upsert(userId, coins) {
    const values = COINS.map((c) => coins[c]);
    await pool.query(
      `INSERT INTO currencies (user_id, pp, gp, sp, cp)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE pp = VALUES(pp), gp = VALUES(gp), sp = VALUES(sp), cp = VALUES(cp)`,
      [userId, ...values]
    );
    return this.getByUserId(userId);
  }
}

module.exports = new CurrencyRepository();
