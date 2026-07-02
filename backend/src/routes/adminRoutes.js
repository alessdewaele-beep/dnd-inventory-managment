const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");

// Alle admin-routes vereisen een geldige token én de rol Admin.
router.use(authenticate, authorize("Admin"));

router.get("/stats", adminController.getStats.bind(adminController));

module.exports = router;
