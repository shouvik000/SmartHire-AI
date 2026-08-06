const db = require("../config/db");

// ==============================
// Show Apply Form
// ==============================
exports.showApplyForm = async (req, res) => {

    try {

        const result = await db.query(
            "SELECT * FROM jobs WHERE id = $1",
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.send("Job Not Found");
        }

        res.render("applications/apply", {
            job: result.rows[0]
        });

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }

};

// ==============================
// Submit Application
// ==============================
exports.applyJob = async (req, res) => {

    try {

        const {
            applicant_name,
            email,
            phone,
            skills,
            cover_letter
        } = req.body;

        // Resume Upload
        const resume_link = req.file
            ? req.file.filename
            : null;

        // Get Required Skills of Job
        const jobResult = await db.query(
            "SELECT required_skills FROM jobs WHERE id = $1",
            [req.params.id]
        );

        const requiredSkills = (jobResult.rows[0].required_skills || "")
            .split(",")
            .map(skill => skill.trim().toLowerCase())
            .filter(skill => skill !== "");

        const candidateSkills = (skills || "")
            .split(",")
            .map(skill => skill.trim().toLowerCase())
            .filter(skill => skill !== "");

        let matched = 0;

        requiredSkills.forEach(skill => {

            if (candidateSkills.includes(skill)) {
                matched++;
            }

        });

        const score = requiredSkills.length === 0
            ? 0
            : Math.round((matched / requiredSkills.length) * 100);

        // Save Application
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
                score
            )

            VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,

            [
                req.params.id,
                applicant_name,
                email,
                phone,
                skills,
                cover_letter,
                resume_link,
                score
            ]

        );

        res.redirect("/applications");

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }

};

// ==============================
// View Applications
// ==============================
exports.viewApplications = async (req, res) => {

    try {

        const result = await db.query(

            `SELECT
                applications.*,
                jobs.title,
                jobs.company

            FROM applications

            INNER JOIN jobs

            ON jobs.id = applications.job_id

            ORDER BY applications.id DESC`

        );

        res.render("applications/applications", {

            applications: result.rows

        });

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }

};