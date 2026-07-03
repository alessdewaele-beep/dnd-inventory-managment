const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");
const { authenticate } = require("../middleware/auth");

// All currency routes require a valid token; the fine-grained check
// (owner/DM/admin) happens in the service via canManage.
router.use(authenticate);

router.get("/:userId", currencyController.getByUserId.bind(currencyController));
router.put("/:userId", currencyController.update.bind(currencyController));

module.exports = router;
