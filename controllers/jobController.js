const db = require("../config/db");

// =============================
// Show Add Job Page
// =============================
exports.showAddJob = (req, res) => {
    res.render("jobs/addJob");
};

// =============================
// Add Job
// =============================
exports.addJob = async (req, res) => {

    try {

        const {
            title,
            company,
            location,
            salary,
            description,
            required_skills
        } = req.body;

        await db.query(

            `INSERT INTO jobs
            (
                title,
                company,
                location,
                salary,
                description,
                required_skills,
                created_by
            )

            VALUES($1,$2,$3,$4,$5,$6,$7)`,

            [
                title,
                company,
                location,
                salary,
                description,
                required_skills,
                req.session.user.id
            ]

        );

        res.redirect("/jobs");

    } catch (err) {

        console.log(err);
        res.send(err.message);

    }

};

// =============================
// View Jobs
// =============================
exports.getJobs = async (req, res) => {

    try {

        const search = req.query.search || "";

        const result = await db.query(

            `SELECT *
             FROM jobs

             WHERE

             LOWER(title) LIKE LOWER($1)

             OR LOWER(company) LIKE LOWER($1)

             OR LOWER(location) LIKE LOWER($1)

             ORDER BY id DESC`,

            [`%${search}%`]

        );

        res.render("jobs/jobs", {

            jobs: result.rows,

            search

        });

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

};

// =============================
// Show Edit Job
// =============================
exports.showEditJob = async (req, res) => {

    try {

        const result = await db.query(

            "SELECT * FROM jobs WHERE id=$1",

            [req.params.id]

        );

        res.render("jobs/editJob", {

            job: result.rows[0]

        });

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

};

// =============================
// Update Job
// =============================
exports.updateJob = async (req, res) => {

    try {

        const {
            title,
            company,
            location,
            salary,
            description,
            required_skills
        } = req.body;

        await db.query(

            `UPDATE jobs

            SET

            title=$1,

            company=$2,

            location=$3,

            salary=$4,

            description=$5,

            required_skills=$6

            WHERE id=$7`,

            [

                title,

                company,

                location,

                salary,

                description,

                required_skills,

                req.params.id

            ]

        );

        res.redirect("/jobs");

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

};

// =============================
// Delete Job
// =============================
exports.deleteJob = async (req, res) => {

    try {

        await db.query(

            "DELETE FROM jobs WHERE id=$1",

            [req.params.id]

        );

        res.redirect("/jobs");

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

};