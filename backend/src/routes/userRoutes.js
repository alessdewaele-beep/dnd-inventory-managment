const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));

router.get("/profile", authenticate, userController.profile.bind(userController));

router.get(
  "/campaign/:campaignId",
  authenticate,
  userController.getByCampaign.bind(userController)
);

router.get(
  "/",
  authenticate,
  authorize("Admin"),
  userController.getAll.bind(userController)
);

router.put(
  "/:id",
  authenticate,
  authorize("Admin"),
  userController.update.bind(userController)
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin"),
  userController.delete.bind(userController)
);

router.post(
  "/:id/reset-password",
  authenticate,
  authorize("Admin"),
  userController.resetPassword.bind(userController)
);

module.exports = router;
