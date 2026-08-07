const hpRepository = require("../repositories/hpRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");

// Tracking is off until the user enables it on the settings page.
const DEFAULT = { enabled: false, maxHp: 10, currentHp: 10, tempHp: 0 };
const MAX_HP_CAP = 9999;

class HpService {
  // May `requester` view/edit the hit points of user `targetUserId`?
  // Same rule as the inventory and currency: the user themselves, an admin,
  // or the DM of their campaign.
  async canManage(requester, targetUserId) {
    if (requester.id === targetUserId) return true;
    if (requester.role === "Admin") return true;

    const target = await userRepository.findById(targetUserId);
    if (!target || !target.campaign_id) return false;

    const campaign = await campaignRepository.getById(target.campaign_id);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  // Returns the HP state; if no row exists yet, the (disabled) default.
  async getForUser(userId) {
    const row = await hpRepository.getByUserId(userId);
    return row ? this.#toDto(row) : { ...DEFAULT };
  }

  // Validates and saves the full HP state. The current HP is clamped to
  // [0, maxHp] so lowering the max on the settings page never leaves an
  // out-of-range value. Returns {error,status} on invalid input, else {hp}.
  async setForUser(userId, data) {
    const enabled = Boolean(data?.enabled);

    const maxHp = Number(data?.maxHp);
    if (!Number.isInteger(maxHp) || maxHp < 1 || maxHp > MAX_HP_CAP) {
      return { error: `Max HP must be an integer between 1 and ${MAX_HP_CAP}`, status: 400 };
    }

    const currentHp = Number(data?.currentHp);
    if (!Number.isInteger(currentHp) || currentHp < 0) {
      return { error: "Current HP must be an integer ≥ 0", status: 400 };
    }

    const tempHp = Number(data?.tempHp);
    if (!Number.isInteger(tempHp) || tempHp < 0 || tempHp > MAX_HP_CAP) {
      return { error: `Temp HP must be an integer between 0 and ${MAX_HP_CAP}`, status: 400 };
    }

    const row = await hpRepository.upsert(userId, {
      enabled,
      maxHp,
      currentHp: Math.min(currentHp, maxHp),
      tempHp,
    });
    return { hp: this.#toDto(row) };
  }

  #toDto(row) {
    return {
      enabled: Boolean(row.enabled),
      maxHp: row.max_hp,
      currentHp: row.current_hp,
      tempHp: row.temp_hp,
    };
  }
}

module.exports = new HpService();
