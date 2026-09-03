
const express = require("express");
const router = express.Router();

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const applicationController = require("../controllers/applicationController");
const { isLoggedIn } = require("../middleware/authMiddleware");


// CLOUDINARY CONFIGURATION


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// CLOUDINARY CONNECTION TEST


cloudinary.api.ping()
    .then(() => {
        console.log("Cloudinary Connected Successfully");
    })
    .catch((err) => {
        console.error("Cloudinary Connection Failed");
        console.error(err.message);
    });


         // CLOUDINARY STORAGE

/* 
Keeps the original file extension in the public_id
 so raw-file URLs end in .pdf / .doc / .docx
 (fixes browser force-download on extensionless URLs) 
 */


const storage = new CloudinaryStorage({

    cloudinary: cloudinary,

    params: async (req, file) => {

        const originalExtension =
            file.originalname
                .split(".")
                .pop()
                .toLowerCase();

        const baseName =
            file.originalname
                .replace(/\.[^/.]+$/, "")
                .replace(/\s+/g, "_");

        const uniquePublicId =
            `${Date.now()}-${baseName}.${originalExtension}`;

        return {

            folder: "smarthire-resumes",

            resource_type: "raw",

            allowed_formats: ["pdf", "doc", "docx"],

            public_id: uniquePublicId

        };

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


// APPLY FOR JOB
// GET /apply/:id

router.get(
    "/apply/:id",
    isLoggedIn,
    applicationController.showApplyForm
);


// SUBMIT APPLICATION
// POST /apply/:id


router.post(
    "/apply/:id",
    isLoggedIn,
    upload.single("resume"),
    applicationController.applyJob
);


// VIEW APPLICATIONS
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


// VIEW RESUME FILE (PROXY THROUGH SERVER)
// GET /resume/view/:id


router.get(
    "/resume/view/:id",
    isLoggedIn,
    applicationController.viewResumeFile
);


/*      
           ACCEPT APPLICATION
    POST /applications/:id/accept 
                                   */


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

