const express = require("express");
const router = express.Router();
const campaignController = require("../controllers/campaignController");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/public", campaignController.getAllPublic.bind(campaignController));

router.use(authenticate);

router.get("/", campaignController.getAll.bind(campaignController));
router.get("/:id", campaignController.getById.bind(campaignController));

router.post("/", authorize("Admin"), campaignController.create.bind(campaignController));
router.put("/:id", authorize("Admin"), campaignController.update.bind(campaignController));
router.delete("/:id", authorize("Admin"), campaignController.delete.bind(campaignController));

router.post("/:id/dm", authorize("Admin"), campaignController.assignDm.bind(campaignController));

module.exports = router;
