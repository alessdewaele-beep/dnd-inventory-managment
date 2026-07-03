const currencyRepository = require("../repositories/currencyRepository");
const userRepository = require("../repositories/userRepository");
const campaignRepository = require("../repositories/campaignRepository");

const COINS = ["pp", "gp", "sp", "cp"];
const EMPTY = { pp: 0, gp: 0, sp: 0, cp: 0 };

class CurrencyService {
  // Mag `requester` het geld van gebruiker `targetUserId` bekijken/bewerken?
  // Zelfde regel als de inventory: de gebruiker zelf, een admin, of de DM van
  // diens campaign. Bekijken == bewerken (gekozen rechtenmodel).
  async canManage(requester, targetUserId) {
    if (requester.id === targetUserId) return true;
    if (requester.role === "Admin") return true;

    const target = await userRepository.findById(targetUserId);
    if (!target || !target.campaign_id) return false;

    const campaign = await campaignRepository.getById(target.campaign_id);
    return !!campaign && campaign.dungeon_master === requester.id;
  }

  // Geeft de beurs terug; bestaat er nog geen rij, dan alles op 0.
  async getForUser(userId) {
    const row = await currencyRepository.getByUserId(userId);
    return row
      ? { pp: row.pp, gp: row.gp, sp: row.sp, cp: row.cp }
      : { ...EMPTY };
  }

  // Valideert en slaat de vier muntaantallen op. Retourneert {error,status}
  // bij ongeldige invoer, anders {currency}.
  async setForUser(userId, coins) {
    const clean = {};
    for (const coin of COINS) {
      const value = Number(coins?.[coin]);
      if (!Number.isInteger(value) || value < 0) {
        return {
          error: `Ongeldig aantal voor ${coin}: enkel gehele getallen ≥ 0`,
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
