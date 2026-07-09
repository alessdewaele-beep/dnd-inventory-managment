const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");
const { authenticate, authorize } = require("../middleware/auth");

// All item routes require a valid token.
router.use(authenticate);

router.get("/", itemController.getAll.bind(itemController));
// Must be declared before "/:id" so "shared" is not treated as an id.
router.get("/shared", itemController.getShared.bind(itemController));
router.get("/:id", itemController.getById.bind(itemController));
router.get("/user/:userId", itemController.getByUserId.bind(itemController));
router.post("/", itemController.create.bind(itemController));
router.post(
  "/:id/send",
  authorize("DM"),
  itemController.send.bind(itemController)
);
// Move an item between personal and campaign-shared inventory.
router.post("/:id/move", itemController.move.bind(itemController));
router.patch("/:id/seen", itemController.markSeen.bind(itemController));
router.put("/:id", itemController.update.bind(itemController));
router.delete("/:id", itemController.delete.bind(itemController));

module.exports = router;
