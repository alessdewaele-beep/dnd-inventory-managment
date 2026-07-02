const pool = require("../database");

class CampaignRepository {
  async getAll() {
    const [rows] = await pool.query("SELECT * FROM campaigns");
    return rows;
  }

  // Minimale, publiek deelbare lijst (voor de registratie-select).
  async getAllPublic() {
    const [rows] = await pool.query("SELECT id, name FROM campaigns");
    return rows;
  }

  async getById(id) {
    const [rows] = await pool.query("SELECT * FROM campaigns WHERE id = ?", [
      id,
    ]);
    return rows[0];
  }

  async create(campaign) {
    // De DM wordt pas na registratie van de karakters aangesteld,
    // dus dungeon_master is bij het aanmaken doorgaans nog leeg.
    const { name, description, dungeon_master = null } = campaign;
    const [result] = await pool.query(
      "INSERT INTO campaigns (name, description, dungeon_master) VALUES (?, ?, ?)",
      [name, description, dungeon_master]
    );
    return { id: result.insertId, ...campaign };
  }

  async update(id, data) {
    const fields = [];
    const values = [];
    for (let key in data) {
      let value = data[key];

      if (value instanceof Date) {
        value = value.toISOString().slice(0, 19).replace("T", " ");
      }

      if (
        typeof value === "string" &&
        value.endsWith("Z") &&
        !isNaN(Date.parse(value))
      ) {
        value = new Date(value).toISOString().slice(0, 19).replace("T", " ");
      }

      fields.push(`${key} = ?`);
      values.push(value);
    }
    values.push(id);

    const [result] = await pool.query(
      `UPDATE campaigns SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) return null;
    return this.getById(id);
  }

  async delete(id) {
    const campaign = await this.getById(id);
    if (!campaign) return null;
    await pool.query("DELETE FROM campaigns WHERE id = ?", [id]);
    return campaign;
  }

  async countAll() {
    const [rows] = await pool.query("SELECT COUNT(*) AS total FROM campaigns");
    return rows[0].total;
  }

  async countWithDm() {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM campaigns WHERE dungeon_master IS NOT NULL"
    );
    return rows[0].total;
  }

  // Aantal (andere) campagnes waarvan `userId` nog DM is, exclusief `exceptId`.
  async countByDungeonMaster(userId, exceptId) {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total FROM campaigns WHERE dungeon_master = ? AND id <> ?",
      [userId, exceptId]
    );
    return rows[0].total;
  }
}

module.exports = new CampaignRepository();
