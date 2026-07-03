const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currencyController");
const { authenticate } = require("../middleware/auth");

// Alle currency-routes vereisen een geldige token; de fijnmazige controle
// (eigenaar/DM/admin) gebeurt in de service via canManage.
router.use(authenticate);

router.get("/:userId", currencyController.getByUserId.bind(currencyController));
router.put("/:userId", currencyController.update.bind(currencyController));

module.exports = router;
