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

    const result = await currencyService.setForUser(userId, req.body);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.currency);
  }
}

module.exports = new CurrencyController();
