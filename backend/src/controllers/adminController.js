const adminService = require("../services/adminService");

class AdminController {
  async getStats(req, res) {
    try {
      const stats = await adminService.getStats();
      res.json(stats);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AdminController();
