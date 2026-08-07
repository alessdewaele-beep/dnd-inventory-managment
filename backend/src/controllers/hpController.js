const hpService = require("../services/hpService");

class HpController {
  async getByUserId(req, res) {
    const userId = Number(req.params.userId);
    const allowed = await hpService.canManage(req.user, userId);
    if (allowed !== true)
      return res.status(403).json({ error: "Insufficient permissions" });

    const hp = await hpService.getForUser(userId);
    res.json(hp);
  }

  async update(req, res) {
    const userId = Number(req.params.userId);
    const allowed = await hpService.canManage(req.user, userId);
    if (allowed !== true)
      return res.status(403).json({ error: "Insufficient permissions" });

    const result = await hpService.setForUser(userId, req.body);
    if (result.error) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    res.json(result.hp);
  }
}

module.exports = new HpController();
