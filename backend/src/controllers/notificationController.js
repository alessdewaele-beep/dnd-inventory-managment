const notificationService = require("../services/notificationService");

class NotificationController {
  async getMine(req, res) {
    const items = await notificationService.list(req.user.id);
    res.json(items);
  }

  async unreadCount(req, res) {
    const count = await notificationService.unreadCount(req.user.id);
    res.json({ count });
  }

  async markRead(req, res) {
    const ok = await notificationService.markRead(
      Number(req.params.id),
      req.user.id
    );
    if (!ok) return res.status(404).json({ message: "Notification not found" });
    res.json({ success: true });
  }

  async markAllRead(req, res) {
    await notificationService.markAllRead(req.user.id);
    res.json({ success: true });
  }
}

module.exports = new NotificationController();
