const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/", isLoggedIn, jobController.getJobs);

router.get("/add", isLoggedIn, jobController.showAddJob);
router.post("/add", isLoggedIn, jobController.addJob);

router.get("/edit/:id", isLoggedIn, jobController.showEditJob);
router.post("/edit/:id", isLoggedIn, jobController.updateJob);

router.get("/delete/:id", isLoggedIn, jobController.deleteJob);

module.exports = router;