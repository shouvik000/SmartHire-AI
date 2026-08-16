const express = require("express");
const router = express.Router();

const jobController = require("../controllers/jobController");
const { isLoggedIn } = require("../middleware/authMiddleware");



// VIEW ALL JOBS
// GET /jobs


router.get(
    "/",
    isLoggedIn,
    jobController.getJobs
);



// SHOW ADD JOB FORM
// GET /jobs/add


router.get(
    "/add",
    isLoggedIn,
    jobController.showAddJob
);



// ADD NEW JOB
// POST /jobs/add


router.post(
    "/add",
    isLoggedIn,
    jobController.addJob
);



// SHOW EDIT JOB FORM
// GET /jobs/edit/:id


router.get(
    "/edit/:id",
    isLoggedIn,
    jobController.showEditJob
);



// UPDATE JOB
// POST /jobs/edit/:id


router.post(
    "/edit/:id",
    isLoggedIn,
    jobController.updateJob
);



// DELETE JOB
// POST /jobs/delete/:id


router.post(
    "/delete/:id",
    isLoggedIn,
    jobController.deleteJob
);



// VIEW SINGLE JOB
// GET /jobs/:id


router.get(
    "/:id",
    isLoggedIn,
    jobController.getJobById
);



// EXPORT ROUTER


module.exports = router;