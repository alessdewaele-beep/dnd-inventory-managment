const UserService = require("../services/userService");
const service = new UserService();

class UserController {
  async register(req, res) {
    try {
      const user = await service.register(req.body);
      res.json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await service.login(username, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  async profile(req, res) {
    // req.user wordt gezet door de authenticate-middleware op de route.
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });
  }

  async getAll(req, res) {
    try {
      const users = await service.getAll();
      res.json(users);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getByCampaign(req, res) {
    try {
      const campaignId = Number(req.params.campaignId);
      const allowed = await service.canViewCampaignPlayers(
        req.user,
        campaignId
      );
      if (!allowed)
        return res.status(403).json({ error: "Onvoldoende rechten" });

      const players = await service.getPlayersByCampaign(campaignId);
      res.json(players);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new UserController();
