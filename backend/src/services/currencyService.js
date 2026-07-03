const currencyRepository = require("../repositories/currencyRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");

const COINS = ["pp", "gp", "sp", "cp"];
const EMPTY = { pp: 0, gp: 0, sp: 0, cp: 0 };

class CurrencyService {
  // May `requester` view/edit the money of user `targetUserId`?
  // Same rule as the inventory: the user themselves, an admin, or the DM of
  // their campaign. Viewing == editing (chosen permission model).
  async canManage(requester, targetUserId) {
    if (requester.id === targetUserId) return true;
    if (requester.role === "Admin") return true;

    const target = await userRepository.findById(targetUserId);
    if (!target || !target.campaign_id) return false;

    const campaign = await campaignRepository.getById(target.campaign_id);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  // Returns the purse; if no row exists yet, everything is 0.
  async getForUser(userId) {
    const row = await currencyRepository.getByUserId(userId);
    return row
      ? { pp: row.pp, gp: row.gp, sp: row.sp, cp: row.cp }
      : { ...EMPTY };
  }

  // Validates and saves the four coin amounts. Returns {error,status}
  // on invalid input, otherwise {currency}.
  async setForUser(userId, coins) {
    const clean = {};
    for (const coin of COINS) {
      const value = Number(coins?.[coin]);
      if (!Number.isInteger(value) || value < 0) {
        return {
          error: `Invalid amount for ${coin}: only integers ≥ 0`,
          status: 400,
        };
      }
      clean[coin] = value;
    }
    const currency = await currencyRepository.upsert(userId, clean);
    return { currency: { pp: currency.pp, gp: currency.gp, sp: currency.sp, cp: currency.cp } };
  }
}

module.exports = new CurrencyService();
