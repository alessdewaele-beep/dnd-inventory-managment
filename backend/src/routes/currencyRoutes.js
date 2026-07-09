const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");
const { authenticate } = require("../middleware/auth");

// All currency routes require a valid token; the fine-grained check
// (owner/DM/admin) happens in the service via canManage.
router.use(authenticate);

// Shared party purse. Declared before "/:userId" so "shared" is not
// treated as a user id.
router.get("/shared", currencyController.getShared.bind(currencyController));
router.put("/shared", currencyController.updateShared.bind(currencyController));
router.post("/transfer", currencyController.transfer.bind(currencyController));

router.get("/:userId", currencyController.getByUserId.bind(currencyController));
router.put("/:userId", currencyController.update.bind(currencyController));

module.exports = router;
