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
    // req.user is set by the authenticate middleware on the route.
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });
  }

  // Own profile incl. campaign name and backstory (reads the DB, unlike /profile).
  async me(req, res) {
    try {
      const profile = await service.getMe(req.user.id);
      if (!profile)
        return res.status(404).json({ error: "User not found" });
      res.json(profile);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
  }

  // Self-service: update own username and/or backstory.
  // On a username change, a fresh token is returned along with it.
  async updateMe(req, res) {
    try {
      const result = await service.updateSelf(req.user, req.body);
      res.json(result);
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
  }

  // Self-service: change password (current password required).
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await service.changePassword(req.user.id, currentPassword, newPassword);
      res.json({ success: true });
    } catch (err) {
      res.status(err.status || 400).json({ error: err.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await service.getAll();
      res.json(users);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await service.deleteUser(Number(req.params.id));
      if (!deleted)
        return res.status(404).json({ error: "User not found" });
      res.json(deleted);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await service.updateUser(Number(req.params.id), req.body);
      if (!updated)
        return res.status(404).json({ error: "User not found" });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getMyCampaignPlayers(req, res) {
    try {
      const players = await service.getMyCampaignPlayers(req.user);
      res.json(players);
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
        return res.status(403).json({ error: "Insufficient permissions" });

      const players = await service.getPlayersByCampaign(campaignId);
      res.json(players);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new UserController();
