const currencyRepository = require("../repositories/currencyRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");
const notificationService = require("./notificationService");

const COINS = ["pp", "gp", "sp", "cp"];
const EMPTY = { pp: 0, gp: 0, sp: 0, cp: 0 };

// Total value in copper, so two purses can be compared regardless of coin mix.
// 1 pp = 10 gp, 1 gp = 10 sp, 1 sp = 10 cp.
const toCopper = (c) => c.pp * 1000 + c.gp * 100 + c.sp * 10 + c.cp;

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

  // Validates the four coin amounts. Returns {clean} or {error,status}.
  #validateCoins(coins) {
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
    return { clean };
  }

  // Validates and saves the four coin amounts. Returns {error,status}
  // on invalid input, otherwise {currency}. `actor` is the logged-in user;
  // when a DM/admin reduces someone else's purse the owner is notified.
  async setForUser(userId, coins, actor) {
    const { clean, error, status } = this.#validateCoins(coins);
    if (error) return { error, status };

    const before = await this.getForUser(userId);
    const currency = await currencyRepository.upsert(userId, clean);

    if (actor && actor.id !== userId && toCopper(clean) < toCopper(before)) {
      await notificationService.notifyCurrencyRemoved(userId, actor);
    }
    return { currency: { pp: currency.pp, gp: currency.gp, sp: currency.sp, cp: currency.cp } };
  }

  // --- Shared party purse ---

  // Which campaign's purse does `requester` share? A DM leads campaign(s)
  // (first one wins); a player belongs to one via users.campaign_id. Returns
  // null when there is no campaign context (e.g. an admin).
  async resolveMyCampaignId(requester) {
    const led = await campaignRepository.getByDungeonMaster(requester.id);
    if (led.length > 0) return led[0].id;
    const user = await userRepository.findById(requester.id);
    return user?.campaign_id ?? null;
  }

  // The shared purse of the requester's own campaign, plus the resolved
  // campaign id (null when the requester has no campaign context).
  async getShared(requester) {
    const campaignId = await this.resolveMyCampaignId(requester);
    if (!campaignId) return { campaignId: null, currency: { ...EMPTY } };
    const row = await currencyRepository.getByCampaignId(campaignId);
    const currency = row
      ? { pp: row.pp, gp: row.gp, sp: row.sp, cp: row.cp }
      : { ...EMPTY };
    return { campaignId, currency };
  }

  // Saves the shared purse of the requester's own campaign. Any campaign
  // member (player or DM) may edit it.
  async setShared(requester, coins) {
    const campaignId = await this.resolveMyCampaignId(requester);
    if (!campaignId) {
      return { error: "You are not part of a campaign", status: 400 };
    }
    const { clean, error, status } = this.#validateCoins(coins);
    if (error) return { error, status };
    const currency = await currencyRepository.upsertCampaign(campaignId, clean);
    return { currency: { pp: currency.pp, gp: currency.gp, sp: currency.sp, cp: currency.cp } };
  }

  // Moves coins between the requester's personal purse and their campaign's
  // shared purse. `direction` is "toShared" or "toPersonal". Returns both
  // updated purses on success, or {error,status}.
  async transfer(requester, direction, coins) {
    if (direction !== "toShared" && direction !== "toPersonal") {
      return { error: "Invalid transfer direction", status: 400 };
    }
    const campaignId = await this.resolveMyCampaignId(requester);
    if (!campaignId) {
      return { error: "You are not part of a campaign", status: 400 };
    }
    const { clean, error, status } = this.#validateCoins(coins);
    if (error) return { error, status };
    if (COINS.every((c) => clean[c] === 0)) {
      return { error: "Enter an amount to transfer", status: 400 };
    }

    try {
      const { personal, shared } = await currencyRepository.transferCoins(
        requester.id,
        campaignId,
        direction,
        clean
      );
      return {
        personal: { pp: personal.pp, gp: personal.gp, sp: personal.sp, cp: personal.cp },
        shared: { pp: shared.pp, gp: shared.gp, sp: shared.sp, cp: shared.cp },
      };
    } catch (err) {
      if (err.code === "INSUFFICIENT_FUNDS") {
        const from = direction === "toShared" ? "your purse" : "the party purse";
        return { error: `Not enough coins in ${from}`, status: 400 };
      }
      throw err;
    }
  }
}

module.exports = new CurrencyService();
