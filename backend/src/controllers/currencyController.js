const currencyService = require("../services/currencyService");

class CurrencyController {
  async getByUserId(req, res) {
    const userId = Number(req.params.userId);
    const allowed = await currencyService.canManage(req.user, userId);
    if (allowed !== true)
      return res.status(403).json({ error: "Insufficient permissions" });

    const currency = await currencyService.getForUser(userId);
    res.json(currency);
  }

  async update(req, res) {
    const userId = Number(req.params.userId);
    const allowed = await currencyService.canManage(req.user, userId);
    if (allowed !== true)
      return res.status(403).json({ error: "Insufficient permissions" });

    const result = await currencyService.setForUser(userId, req.body, req.user);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.currency);
  }

  // Shared party purse of the logged-in user's own campaign.
  async getShared(req, res) {
    const result = await currencyService.getShared(req.user);
    res.json(result); // { campaignId, currency }
  }

  async updateShared(req, res) {
    const result = await currencyService.setShared(req.user, req.body);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.currency);
  }

  // Move coins between the own personal purse and the party purse.
  async transfer(req, res) {
    const { direction, coins } = req.body;
    const result = await currencyService.transfer(req.user, direction, coins);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json({ personal: result.personal, shared: result.shared });
  }
}

module.exports = new CurrencyController();
