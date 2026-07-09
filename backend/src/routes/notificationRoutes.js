const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");

// Everyone only ever sees/edits their own notifications (scoped by req.user).
router.use(authenticate);

router.get("/", notificationController.getMine.bind(notificationController));
router.get(
  "/unread-count",
  notificationController.unreadCount.bind(notificationController)
);
router.patch(
  "/read-all",
  notificationController.markAllRead.bind(notificationController)
);
router.patch(
  "/:id/read",
  notificationController.markRead.bind(notificationController)
);

module.exports = router;
