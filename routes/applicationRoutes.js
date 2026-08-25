const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const applicationController = require("../controllers/applicationController");
const { isLoggedIn } = require("../middleware/authMiddleware");



// RESUME UPLOAD DIRECTORY


const uploadDir = path.join(__dirname, "..", "uploads");

// Create uploads folder automatically if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}



// MULTER - RESUME UPLOAD CONFIGURATION


const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, uploadDir);

    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname).toLowerCase();

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            extension;

        cb(null, uniqueName);

    }

});



// MULTER CONFIGURATION


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



// APPLY FOR JOB - SHOW FORM
// GET /apply/:id


router.get(

    "/apply/:id",

    isLoggedIn,

    applicationController.showApplyForm

);



// APPLY FOR JOB - SUBMIT FORM
// POST /apply/:id


router.post(

    "/apply/:id",

    isLoggedIn,

    upload.single("resume"),

    applicationController.applyJob

);



// VIEW RECEIVED APPLICATIONS
// GET /applications


router.get(

    "/applications",

    isLoggedIn,

    applicationController.viewApplications

);



// VIEW SINGLE APPLICATION
// GET /applications/:id


router.get(

    "/applications/:id",

    isLoggedIn,

    applicationController.viewApplication

);



// ACCEPT APPLICATION
// POST /applications/:id/accept


router.post(

    "/applications/:id/accept",

    isLoggedIn,

    applicationController.acceptApplication

);



// DELETE APPLICATION
// POST /applications/:id/delete


router.post(

    "/applications/:id/delete",

    isLoggedIn,

    applicationController.deleteApplication

);



// EXPORT ROUTER


module.exports = router;