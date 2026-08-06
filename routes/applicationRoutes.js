const express = require("express");
const router = express.Router();

const applicationController = require("../controllers/applicationController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const upload = require("../config/multer");

// Show Apply Form
router.get(
    "/apply/:id",
    isLoggedIn,
    applicationController.showApplyForm
);

// Submit Application
router.post(
    "/apply/:id",
    isLoggedIn,
    upload.single("resume"),
    applicationController.applyJob
);

// View Applications
router.get(
    "/applications",
    isLoggedIn,
    applicationController.viewApplications
);

module.exports = router;