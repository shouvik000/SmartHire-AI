 
 const db = require("../config/db");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");


// ======================================================
// EXTRACT TEXT FROM CLOUDINARY RESUME
// ======================================================

async function extractResumeText(file) {

    if (!file || !file.path) {
        return "";
    }

    try {

        console.log("Downloading resume from Cloudinary...");
        console.log("Resume URL:", file.path);

        // Download Cloudinary file
        const response = await fetch(file.path);

        if (!response.ok) {

            console.error(
                "Unable to download resume:",
                response.status,
                response.statusText
            );

            return "";
        }

        // Convert response to Buffer
        const arrayBuffer = await response.arrayBuffer();

        const buffer = Buffer.from(arrayBuffer);

        const originalName =
            file.originalname || "";

        const extension =
            originalName
                .toLowerCase()
                .split(".")
                .pop();


        // ==================================================
        // PDF
        // ==================================================

        if (extension === "pdf") {

            try {

                const parser = new PDFParse({
                    data: buffer
                });

                const result =
                    await parser.getText();

                await parser.destroy();

                return result.text || "";

            } catch (error) {

                console.error(
                    "PDF Extraction Error:",
                    error
                );

                return "";
            }
        }


        // ==================================================
        // DOCX
        // ==================================================

        if (extension === "docx") {

            try {

                const result =
                    await mammoth.extractRawText({
                        buffer: buffer
                    });

                return result.value || "";

            } catch (error) {

                console.error(
                    "DOCX Extraction Error:",
                    error
                );

                return "";
            }
        }


        // ==================================================
        // DOC
        // ==================================================

        if (extension === "doc") {

            console.log(
                "DOC format uploaded."
            );

            console.log(
                "Text extraction for DOC is not supported."
            );

            return "";
        }


        return "";

    } catch (error) {

        console.error(
            "Resume Extraction Error:",
            error
        );

        return "";
    }
}



// ======================================================
// NORMALIZE SKILL
// ======================================================

function normalizeSkill(skill) {

    return String(skill)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}



// ======================================================
// CALCULATE RESUME MATCH SCORE
// ======================================================

function calculateMatchScore(
    resumeText,
    requiredSkills
) {

    if (
        !resumeText ||
        !requiredSkills
    ) {

        return {
            score: 0,
            matchedSkills: [],
            missingSkills: []
        };

    }


    const resume =
        String(resumeText)
            .toLowerCase();


    const required =
        String(requiredSkills)
            .split(",")
            .map(skill =>
                normalizeSkill(skill)
            )
            .filter(Boolean);


    if (required.length === 0) {

        return {
            score: 0,
            matchedSkills: [],
            missingSkills: []
        };

    }


    const matchedSkills = [];
    const missingSkills = [];


    required.forEach(skill => {

        if (resume.includes(skill)) {

            matchedSkills.push(skill);

        } else {

            missingSkills.push(skill);

        }

    });


    const score =
        Math.round(
            (
                matchedSkills.length /
                required.length
            ) * 100
        );


    return {

        score,

        matchedSkills,

        missingSkills

    };

}



// ======================================================
// SHOW APPLY FORM
// GET /apply/:id
// ======================================================

exports.showApplyForm = async (
    req,
    res
) => {

    try {

        const jobId =
            Number(req.params.id);


        if (!Number.isInteger(jobId)) {

            return res.status(400).send(
                "Invalid Job ID."
            );

        }


        const result =
            await db.query(

                `SELECT *
                 FROM jobs
                 WHERE id = $1`,

                [jobId]

            );


        if (result.rows.length === 0) {

            return res.status(404).send(
                "Job Not Found"
            );

        }


        res.render(
            "applications/apply",
            {
                job: result.rows[0],
                user: req.session.user
            }
        );


    } catch (err) {

        console.error(
            "Apply Form Error:",
            err
        );


        res.status(500).send(
            "Unable to open application form."
        );

    }

};



// ======================================================
// SUBMIT APPLICATION
// POST /apply/:id
// ======================================================

exports.applyJob = async (
    req,
    res
) => {

    try {

        console.log(
            "========================================"
        );

        console.log(
            "APPLICATION SUBMISSION STARTED"
        );

        console.log(
            "Job ID:",
            req.params.id
        );


        console.log(
            "Uploaded File:",
            req.file
                ? req.file.originalname
                : "NO FILE"
        );


        console.log(
            "Cloudinary URL:",
            req.file
                ? req.file.path
                : "NO URL"
        );


        const {

            applicant_name,
            email,
            phone,
            skills,
            cover_letter

        } = req.body;



        // ==================================================
        // VALIDATE USER INPUT
        // ==================================================

        if (
            !applicant_name ||
            !email ||
            !phone
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );

        }



        // ==================================================
        // VALIDATE JOB ID
        // ==================================================

        const jobId =
            Number(req.params.id);


        if (!Number.isInteger(jobId)) {

            return res.status(400).send(
                "Invalid Job ID."
            );

        }



        // ==================================================
        // CHECK RESUME
        // ==================================================

        if (!req.file) {

            return res.status(400).send(`
                <div style="
                    font-family: Arial;
                    text-align: center;
                    margin-top: 80px;
                ">

                    <h2>Resume Required</h2>

                    <p>
                        Please upload your resume
                        before submitting the application.
                    </p>

                    <a href="/apply/${jobId}">
                        Go Back
                    </a>

                </div>
            `);

        }



        // ==================================================
        // CHECK CLOUDINARY URL
        // ==================================================

        if (!req.file.path) {

            console.error(
                "Cloudinary URL missing."
            );

            return res.status(500).send(
                "Resume upload failed. Please try again."
            );

        }



        // ==================================================
        // GET JOB
        // ==================================================

        const jobResult =
            await db.query(

                `SELECT *
                 FROM jobs
                 WHERE id = $1`,

                [jobId]

            );


        if (jobResult.rows.length === 0) {

            return res.status(404).send(
                "Job Not Found"
            );

        }


        const job =
            jobResult.rows[0];


        console.log(
            "Job Found:",
            job.title
        );



        // ==================================================
        // EXTRACT RESUME TEXT
        // ==================================================

        const resumeText =
            await extractResumeText(
                req.file
            );


        console.log(
            "Resume Text Length:",
            resumeText.length
        );



        // ==================================================
        // CALCULATE MATCH SCORE
        // ==================================================

        const matchResult =
            calculateMatchScore(

                resumeText,

                job.required_skills

            );


        console.log(
            "Required Skills:",
            job.required_skills
        );


        console.log(
            "Applicant Skills:",
            skills
        );


        console.log(
            "Matched Skills:",
            matchResult.matchedSkills
        );


        console.log(
            "Missing Skills:",
            matchResult.missingSkills
        );


        console.log(
            "Resume Match Score:",
            matchResult.score + "%"
        );



        // ==================================================
        // SAVE APPLICATION
        // ==================================================

        const applicationResult =
            await db.query(

                `INSERT INTO applications
                (
                    job_id,
                    applicant_name,
                    email,
                    phone,
                    skills,
                    cover_letter,
                    resume_link,
                    match_score,
                    status
                )

                VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9)

                RETURNING id`,

                [

                    jobId,

                    applicant_name,

                    email,

                    phone,

                    skills || "",

                    cover_letter || "",

                    // IMPORTANT:
                    // Store Cloudinary URL
                    req.file.path,

                    matchResult.score,

                    "Applied"

                ]

            );


        console.log(
            "Application saved successfully:",
            applicationResult.rows[0]
        );



        // ==================================================
        // SUCCESS PAGE
        // ==================================================

        return res.render(

            "applications/success",

            {

                applicantName:
                    applicant_name,

                jobTitle:
                    job.title,

                matchScore:
                    matchResult.score,

                matchedSkills:
                    matchResult.matchedSkills,

                missingSkills:
                    matchResult.missingSkills

            }

        );


    } catch (err) {

        console.error(
            "========================================"
        );

        console.error(
            "APPLICATION ERROR"
        );

        console.error(
            err
        );

        console.error(
            "========================================"
        );


        return res.status(500).send(`

            <div style="
                font-family: Arial;
                max-width: 700px;
                margin: 80px auto;
                padding: 30px;
                text-align: center;
            ">

                <h2 style="color:#dc3545;">
                    Application Submission Failed
                </h2>

                <p>
                    Something went wrong while
                    submitting your application.
                </p>

                <p>
                    Please try again.
                </p>

                
                    href="/apply/${req.params.id}"
                    style="
                        display:inline-block;
                        margin-top:20px;
                        padding:10px 20px;
                        background:#0d6efd;
                        color:white;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Try Again
                </a>

            </div>

        `);

    }

};



// ======================================================
// VIEW APPLICATIONS
// ONLY APPLICATIONS FOR LOGGED-IN USER'S JOBS
// ======================================================

exports.viewApplications = async (
    req,
    res
) => {

    try {

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            req.session.user.id;


        const result =
            await db.query(

                `SELECT

                    applications.id,
                    applications.job_id,
                    applications.applicant_name,
                    applications.email,
                    applications.phone,
                    applications.skills,
                    applications.cover_letter,
                    applications.resume_link,
                    applications.created_at,
                    applications.match_score,
                    applications.status,

                    jobs.title AS job_title,
                    jobs.company,
                    jobs.location

                 FROM applications

                 INNER JOIN jobs
                    ON jobs.id = applications.job_id

                 WHERE jobs.created_by = $1

                 ORDER BY applications.id DESC`,

                [userId]

            );


        res.render(

            "applications/applications",

            {

                applications:
                    result.rows,

                user:
                    req.session.user

            }

        );


    } catch (err) {

        console.error(
            "View Applications Error:",
            err
        );


        res.status(500).send(
            "Unable to load applications."
        );

    }

};



// ======================================================
// VIEW SINGLE APPLICATION
// ======================================================

exports.viewApplication = async (
    req,
    res
) => {

    try {

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            req.session.user.id;


        const applicationId =
            Number(req.params.id);


        if (!Number.isInteger(applicationId)) {

            return res.status(400).send(
                "Invalid Application ID."
            );

        }


        const result =
            await db.query(

                `SELECT

                    applications.*,

                    jobs.title AS job_title,
                    jobs.company,
                    jobs.location,
                    jobs.required_skills

                 FROM applications

                 INNER JOIN jobs
                    ON jobs.id = applications.job_id

                 WHERE applications.id = $1
                 AND jobs.created_by = $2`,

                [

                    applicationId,

                    userId

                ]

            );


        if (result.rows.length === 0) {

            return res.status(404).send(
                "Application not found."
            );

        }


        const application =
            result.rows[0];


        application.match_score =
            Number(
                application.match_score || 0
            );


        res.render(

            "applications/viewApplication",

            {

                application,

                user:
                    req.session.user

            }

        );


    } catch (err) {

        console.error(
            "View Single Application Error:",
            err
        );


        res.status(500).send(
            "Unable to load application."
        );

    }

};



// ======================================================
// VIEW RESUME FILE (PROXY THROUGH SERVER)
// GET /resume/view/:id
// Downloads the file from Cloudinary server-side and
// re-serves it with "inline" disposition so PDFs open
// in the browser instead of force-downloading.
// ======================================================

exports.viewResumeFile = async (
    req,
    res
) => {

    try {

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            req.session.user.id;


        const applicationId =
            Number(req.params.id);


        if (!Number.isInteger(applicationId)) {

            return res.status(400).send(
                "Invalid Application ID."
            );

        }


        // ==================================================
        // OWNERSHIP CHECK
        // Only the recruiter who owns the job can view it
        // ==================================================

        const result =
            await db.query(

                `SELECT
                    applications.resume_link

                 FROM applications

                 INNER JOIN jobs
                    ON jobs.id = applications.job_id

                 WHERE applications.id = $1
                 AND jobs.created_by = $2`,

                [

                    applicationId,

                    userId

                ]

            );


        if (
            result.rows.length === 0 ||
            !result.rows[0].resume_link
        ) {

            return res.status(404).send(
                "Resume not found."
            );

        }


        const resumeUrl =
            result.rows[0].resume_link;


        console.log(
            "Proxying resume:",
            resumeUrl
        );


        // ==================================================
        // FETCH FILE FROM CLOUDINARY
        // ==================================================

        const response =
            await fetch(resumeUrl);


        if (!response.ok) {

            console.error(
                "Cloudinary fetch failed:",
                response.status,
                response.statusText
            );

            return res.status(502).send(
                "Unable to fetch resume from storage."
            );

        }


        const arrayBuffer =
            await response.arrayBuffer();


        const buffer =
            Buffer.from(arrayBuffer);


        // ==================================================
        // DETERMINE CONTENT TYPE FROM EXTENSION
        // ==================================================

        const extension =
            resumeUrl
                .toLowerCase()
                .split(".")
                .pop();


        const contentTypes = {

            pdf: "application/pdf",

            doc: "application/msword",

            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        };


        res.setHeader(
            "Content-Type",
            contentTypes[extension] ||
                "application/octet-stream"
        );


        // ==================================================
        // FORCE INLINE DISPLAY (NOT DOWNLOAD)
        // ==================================================

        res.setHeader(
            "Content-Disposition",
            "inline"
        );


        return res.send(buffer);


    } catch (err) {

        console.error(
            "View Resume File Error:",
            err
        );

        res.status(500).send(
            "Unable to load resume."
        );

    }

};



// ======================================================
// ACCEPT APPLICATION
// ======================================================

exports.acceptApplication = async (
    req,
    res
) => {

    try {

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            req.session.user.id;


        const applicationId =
            Number(req.params.id);


        if (!Number.isInteger(applicationId)) {

            return res.status(400).send(
                "Invalid Application ID."
            );

        }


        const result =
            await db.query(

                `UPDATE applications

                 SET status = 'Accepted'

                 WHERE id = $1

                 AND job_id IN (

                     SELECT id
                     FROM jobs
                     WHERE created_by = $2

                 )

                 RETURNING *`,

                [

                    applicationId,

                    userId

                ]

            );


        if (result.rows.length === 0) {

            return res.status(404).send(
                "Application not found or you do not have permission."
            );

        }


        console.log(
            `Application ${applicationId} accepted by user ${userId}`
        );


        res.redirect(
            "/applications"
        );


    } catch (err) {

        console.error(
            "Accept Application Error:",
            err
        );


        res.status(500).send(
            "Unable to accept application."
        );

    }

};



// ======================================================
// DELETE APPLICATION
// ======================================================

exports.deleteApplication = async (
    req,
    res
) => {

    try {

        if (!req.session.user) {

            return res.redirect(
                "/login"
            );

        }


        const userId =
            req.session.user.id;


        const applicationId =
            Number(req.params.id);


        if (!Number.isInteger(applicationId)) {

            return res.status(400).send(
                "Invalid Application ID."
            );

        }


        // ==================================================
        // CHECK APPLICATION BELONGS TO USER'S JOB
        // ==================================================

        const applicationResult =
            await db.query(

                `SELECT
                    applications.id

                 FROM applications

                 INNER JOIN jobs
                    ON jobs.id = applications.job_id

                 WHERE applications.id = $1

                 AND jobs.created_by = $2`,

                [

                    applicationId,

                    userId

                ]

            );


        if (applicationResult.rows.length === 0) {

            return res.status(404).send(
                "Application not found or you do not have permission."
            );

        }


        // ==================================================
        // DELETE APPLICATION
        // ==================================================

        await db.query(

            `DELETE FROM applications

             WHERE id = $1`,

            [applicationId]

        );


        console.log(
            `Application ${applicationId} deleted by user ${userId}`
        );


        res.redirect(
            "/applications"
        );


    } catch (err) {

        console.error(
            "Delete Application Error:",
            err
        );


        res.status(500).send(
            "Unable to delete application."
        );

    }

};

