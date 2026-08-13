const db = require("../config/db");
const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

// =====================================================
// EXTRACT TEXT FROM RESUME
// =====================================================

async function extractResumeText(file) {

    if (!file) {
        return "";
    }

    const filePath = path.join(
        __dirname,
        "..",
        "uploads",
        file.filename
    );

    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    // -------------------------
    // PDF
    // -------------------------

    if (extension === ".pdf") {

        try {

            const data = fs.readFileSync(filePath);

            const parser = new PDFParse({
                data: data
            });

            const result = await parser.getText();

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

    // -------------------------
    // DOCX
    // -------------------------

    if (extension === ".docx") {

        try {

            const result =
                await mammoth.extractRawText({
                    path: filePath
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

    // -------------------------
    // TXT
    // -------------------------

    if (extension === ".txt") {

        try {

            return fs.readFileSync(
                filePath,
                "utf8"
            );

        } catch (error) {

            console.error(
                "TXT Extraction Error:",
                error
            );

            return "";

        }
    }

    return "";
}


// =====================================================
// NORMALIZE SKILL
// =====================================================

function normalizeSkill(skill) {

    return skill
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}


// =====================================================
// CALCULATE RESUME MATCH SCORE
// =====================================================

function calculateMatchScore(
    resumeText,
    requiredSkills
) {

    if (!resumeText || !requiredSkills) {

        return {
            score: 0,
            matchedSkills: [],
            missingSkills: []
        };

    }

    const resume =
        resumeText.toLowerCase();

    const required = requiredSkills
        .split(",")
        .map(skill => normalizeSkill(skill))
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

    const score = Math.round(
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


// =====================================================
// SHOW APPLY FORM
// =====================================================

exports.showApplyForm = async (req, res) => {

    try {

        const result = await db.query(

            `SELECT *
             FROM jobs
             WHERE id=$1`,

            [req.params.id]

        );

        if (result.rows.length === 0) {

            return res.status(404).send(
                "Job Not Found"
            );

        }

        res.render(
            "applications/apply",
            {
                job: result.rows[0]
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


// =====================================================
// SUBMIT APPLICATION
// =====================================================

exports.applyJob = async (req, res) => {

    try {

        const {
            applicant_name,
            email,
            phone,
            skills,
            cover_letter
        } = req.body;

        // -------------------------
        // Validation
        // -------------------------

        if (
            !applicant_name ||
            !email ||
            !phone
        ) {

            return res.status(400).send(
                "Please fill all required fields."
            );

        }

        // -------------------------
        // Get Job
        // -------------------------

        const jobResult = await db.query(

            `SELECT *
             FROM jobs
             WHERE id=$1`,

            [req.params.id]

        );

        if (jobResult.rows.length === 0) {

            return res.status(404).send(
                "Job Not Found"
            );

        }

        const job = jobResult.rows[0];

        // -------------------------
        // Resume Required
        // -------------------------

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

                    <a href="/apply/${req.params.id}">
                        Go Back
                    </a>

                </div>

            `);

        }

        // -------------------------
        // Extract Resume
        // -------------------------

        const resumeText =
            await extractResumeText(req.file);

        console.log(
            "Resume Text Length:",
            resumeText.length
        );

        // -------------------------
        // Calculate Match
        // -------------------------

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

        // -------------------------
        // Save Application
        // -------------------------

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
            ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,

            [
                req.params.id,
                applicant_name,
                email,
                phone,
                skills || "",
                cover_letter || "",
                req.file.filename,
                matchResult.score,
                "Applied"
            ]

        );

        // -------------------------
        // Success Page
        // -------------------------

        res.render(

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
            "APPLICATION ERROR:",
            err
        );

        res.status(500).send(`

            <div style="
                font-family: Arial;
                text-align: center;
                margin-top: 80px;
            ">

                <h2>
                    Application Submission Failed
                </h2>

                <p>
                    ${err.message}
                </p>

                <br>

                <a href="/jobs">
                    Back to Jobs
                </a>

            </div>

        `);

    }

};


// =====================================================
// VIEW APPLICATIONS
// ONLY APPLICATIONS FOR LOGGED-IN USER'S JOBS
// =====================================================

exports.viewApplications = async (req, res) => {

    try {

        // Make sure user is logged in

        if (!req.session.user) {

            return res.redirect("/login");

        }

        const userId =
            req.session.user.id;

        console.log(
            "Viewing applications for user:",
            userId
        );

        // IMPORTANT:
        // Only show applications submitted
        // to jobs created by this user.

        const result = await db.query(

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

        console.log(
            "Applications found:",
            result.rows.length
        );

        res.render(

            "applications/applications",

            {
                applications: result.rows
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


// =====================================================
// VIEW SINGLE APPLICATION
// =====================================================

exports.viewApplication = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect("/login");

        }

        const userId =
            req.session.user.id;

        const applicationId =
            req.params.id;

        const result = await db.query(

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

        res.render(

            "applications/viewApplication",

            {
                application:
                    result.rows[0]
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


// =====================================================
// ACCEPT APPLICATION
// =====================================================

exports.acceptApplication = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect("/login");

        }

        const userId =
            req.session.user.id;

        const applicationId =
            req.params.id;

        // Only allow employer to accept
        // applications for their own jobs.

        const result = await db.query(

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

        res.redirect("/applications");

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


// =====================================================
// DELETE APPLICATION
// =====================================================

exports.deleteApplication = async (req, res) => {

    try {

        if (!req.session.user) {

            return res.redirect("/login");

        }

        const userId =
            req.session.user.id;

        const applicationId =
            req.params.id;

        // First find the resume belonging to
        // this employer's application.

        const applicationResult = await db.query(

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

        if (applicationResult.rows.length === 0) {

            return res.status(404).send(
                "Application not found or you do not have permission."
            );

        }

        const resumeLink =
            applicationResult.rows[0].resume_link;

        // -------------------------
        // Delete Application
        // -------------------------

        await db.query(

            `DELETE FROM applications

             WHERE id = $1

             AND job_id IN (
                 SELECT id
                 FROM jobs
                 WHERE created_by = $2
             )`,

            [
                applicationId,
                userId
            ]

        );

        // -------------------------
        // Delete Resume File
        // -------------------------

        if (resumeLink) {

            const resumePath = path.join(
                __dirname,
                "..",
                "uploads",
                resumeLink
            );

            if (fs.existsSync(resumePath)) {

                try {

                    fs.unlinkSync(resumePath);

                    console.log(
                        "Resume deleted:",
                        resumeLink
                    );

                } catch (fileError) {

                    console.error(
                        "Resume File Delete Error:",
                        fileError
                    );

                }

            }

        }

        console.log(
            `Application ${applicationId} deleted by user ${userId}`
        );

        res.redirect("/applications");

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