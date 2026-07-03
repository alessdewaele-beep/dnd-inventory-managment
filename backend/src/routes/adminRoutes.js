const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");

// All admin routes require a valid token and the Admin role.
router.use(authenticate, authorize("Admin"));

router.get("/stats", adminController.getStats.bind(adminController));

module.exports = router;
