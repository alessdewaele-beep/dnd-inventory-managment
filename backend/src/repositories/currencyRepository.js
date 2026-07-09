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

  // One row per user: create or overwrite.
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

  // --- Shared party purse (one row per campaign) ---
  async getByCampaignId(campaignId) {
    const [rows] = await pool.query(
      "SELECT campaign_id, pp, gp, sp, cp FROM campaign_currencies WHERE campaign_id = ?",
      [campaignId]
    );
    return rows[0] || null;
  }

  async upsertCampaign(campaignId, coins) {
    const values = COINS.map((c) => coins[c]);
    await pool.query(
      `INSERT INTO campaign_currencies (campaign_id, pp, gp, sp, cp)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE pp = VALUES(pp), gp = VALUES(gp), sp = VALUES(sp), cp = VALUES(cp)`,
      [campaignId, ...values]
    );
    return this.getByCampaignId(campaignId);
  }

  // Atomically moves `coins` between a player's personal purse and their
  // campaign's shared purse. `direction` is "toShared" (personal -> shared)
  // or "toPersonal" (shared -> personal). Both rows are locked and updated in
  // one transaction; throws an Error with .code = "INSUFFICIENT_FUNDS" when
  // the source purse cannot cover the amount. Returns { personal, shared }.
  async transferCoins(userId, campaignId, direction, coins) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Make sure both purses exist, then lock them for the transaction.
      await conn.query(
        "INSERT IGNORE INTO currencies (user_id) VALUES (?)",
        [userId]
      );
      await conn.query(
        "INSERT IGNORE INTO campaign_currencies (campaign_id) VALUES (?)",
        [campaignId]
      );
      const [personalRows] = await conn.query(
        "SELECT pp, gp, sp, cp FROM currencies WHERE user_id = ? FOR UPDATE",
        [userId]
      );
      const [sharedRows] = await conn.query(
        "SELECT pp, gp, sp, cp FROM campaign_currencies WHERE campaign_id = ? FOR UPDATE",
        [campaignId]
      );
      const personal = personalRows[0];
      const shared = sharedRows[0];

      const source = direction === "toShared" ? personal : shared;
      const dest = direction === "toShared" ? shared : personal;

      for (const c of COINS) {
        if (source[c] < coins[c]) {
          const err = new Error("INSUFFICIENT_FUNDS");
          err.code = "INSUFFICIENT_FUNDS";
          throw err;
        }
      }
      for (const c of COINS) {
        source[c] -= coins[c];
        dest[c] += coins[c];
      }

      await conn.query(
        "UPDATE currencies SET pp = ?, gp = ?, sp = ?, cp = ? WHERE user_id = ?",
        [personal.pp, personal.gp, personal.sp, personal.cp, userId]
      );
      await conn.query(
        "UPDATE campaign_currencies SET pp = ?, gp = ?, sp = ?, cp = ? WHERE campaign_id = ?",
        [shared.pp, shared.gp, shared.sp, shared.cp, campaignId]
      );

      await conn.commit();
      return { personal, shared };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = new CurrencyRepository();
