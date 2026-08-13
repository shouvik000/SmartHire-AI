const express = require("express");
const router = express.Router();
const multer = require("multer");

const applicationController =
    require("../controllers/applicationController");

const { isLoggedIn } =
    require("../middleware/authMiddleware");


// ======================================================
// MULTER - RESUME UPLOAD CONFIGURATION
// ======================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, "uploads/");

    },

    filename: function (req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname.replace(/\s+/g, "-");

        cb(null, uniqueName);

    }

});


const upload = multer({

    storage: storage,

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: function (req, file, cb) {

        const allowedTypes = [

            "application/pdf",

            "application/msword",

            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        ];


        if (allowedTypes.includes(file.mimetype)) {

            cb(null, true);

        } else {

            cb(
                new Error(
                    "Only PDF, DOC and DOCX resumes are allowed."
                )
            );

        }

    }

});


// ======================================================
// APPLY FOR A JOB - SHOW FORM
// GET /apply/:id
// ======================================================

router.get(
    "/apply/:id",
    isLoggedIn,
    applicationController.showApplyForm
);


// ======================================================
// APPLY FOR A JOB - SUBMIT FORM
// POST /apply/:id
// ======================================================

router.post(
    "/apply/:id",
    isLoggedIn,
    upload.single("resume"),
    applicationController.applyJob
);


// ======================================================
// VIEW ALL APPLICATIONS
// GET /applications
// ======================================================

router.get(
    "/applications",
    isLoggedIn,
    applicationController.viewApplications
);


// ======================================================
// VIEW ONE APPLICATION
// GET /applications/:id
// ======================================================

router.get(
    "/applications/:id",
    isLoggedIn,
    applicationController.viewApplication
);


// ======================================================
// ACCEPT APPLICATION
// POST /applications/:id/accept
// ======================================================

router.post(
    "/applications/:id/accept",
    isLoggedIn,
    applicationController.acceptApplication
);


// ======================================================
// DELETE APPLICATION
// POST /applications/:id/delete
// ======================================================

router.post(
    "/applications/:id/delete",
    isLoggedIn,
    applicationController.deleteApplication
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;