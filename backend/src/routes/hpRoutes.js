const express = require("express");
const router = express.Router();
const hpController = require("../controllers/hpController");
const { authenticate } = require("../middleware/auth");

// All HP routes require a valid token; the fine-grained check
// (owner/DM/admin) happens in the service via canManage.
router.use(authenticate);

router.get("/:userId", hpController.getByUserId.bind(hpController));
router.put("/:userId", hpController.update.bind(hpController));

module.exports = router;
