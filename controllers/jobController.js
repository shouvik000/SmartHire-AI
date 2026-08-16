const db = require("../config/db");



// SHOW ADD JOB PAGE
// GET /jobs/add


exports.showAddJob = (req, res) => {

    res.render("jobs/addJob", {
        user: req.session.user
    });

};



// ADD JOB
// POST /jobs/add


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


        // Check login
        if (!req.session.user) {
            return res.redirect("/auth/login");
        }


        // Validation
        if (!title || !company || !location || !description) {

            return res.status(400).send(
                "Please fill all required job fields."
            );

        }


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
            VALUES
            ($1, $2, $3, $4, $5, $6, $7)`,

            [
                title.trim(),
                company.trim(),
                location.trim(),
                salary || "",
                description.trim(),
                required_skills || "",
                req.session.user.id
            ]

        );


        res.redirect("/jobs");


    } catch (err) {

        console.error("Add Job Error:", err);

        res.status(500).send(
            "Unable to create job: " + err.message
        );

    }

};



// VIEW ALL JOBS
// GET /jobs

exports.getJobs = async (req, res) => {

    try {

        const search = String(
            req.query.search || ""
        ).trim();


        const searchTerm = `%${search.toLowerCase()}%`;


       


        const result = await db.query(

            `SELECT
                jobs.*,
                users.name AS posted_by

             FROM jobs

             LEFT JOIN users
             ON users.id = jobs.created_by

             WHERE
                LOWER(COALESCE(jobs.title, '')) LIKE $1
                OR LOWER(COALESCE(jobs.company, '')) LIKE $1
                OR LOWER(COALESCE(jobs.location, '')) LIKE $1

             ORDER BY jobs.id DESC`,

            [searchTerm]

        );


        res.render(

            "jobs/jobs",

            {
                jobs: result.rows,
                search: search,
                user: req.session.user
            }

        );


    } catch (err) {

        console.error("Get Jobs Error:", err);

        res.status(500).send(
            "Unable to load jobs: " + err.message
        );

    }

};



// SHOW EDIT JOB PAGE
// GET /jobs/edit/:id

exports.showEditJob = async (req, res) => {

    try {

        if (!req.session.user) {
            return res.redirect("/auth/login");
        }


        const result = await db.query(

            `SELECT *
             FROM jobs
             WHERE id = $1
             AND created_by = $2`,

            [
                req.params.id,
                req.session.user.id
            ]

        );


        if (result.rows.length === 0) {

            return res.status(403).send(
                "You are not allowed to edit this job."
            );

        }


        res.render(

            "jobs/editJob",

            {
                job: result.rows[0],
                user: req.session.user
            }

        );


    } catch (err) {

        console.error(
            "Show Edit Job Error:",
            err
        );

        res.status(500).send(
            "Unable to open edit page: " + err.message
        );

    }

};



// UPDATE JOB
// POST /jobs/edit/:id


exports.updateJob = async (req, res) => {

    try {

        if (!req.session.user) {
            return res.redirect("/auth/login");
        }


        const {
            title,
            company,
            location,
            salary,
            description,
            required_skills
        } = req.body;


        // Validation

        if (
            !title ||
            !company ||
            !location ||
            !description
        ) {

            return res.status(400).send(
                "Please fill all required job fields."
            );

        }


        /*
         * Update only the job belonging
         * to the logged-in user.
         */

        const result = await db.query(

            `UPDATE jobs

             SET
                title = $1,
                company = $2,
                location = $3,
                salary = $4,
                description = $5,
                required_skills = $6

             WHERE id = $7
             AND created_by = $8

             RETURNING id`,

            [

                title.trim(),

                company.trim(),

                location.trim(),

                salary || "",

                description.trim(),

                required_skills || "",

                req.params.id,

                req.session.user.id

            ]

        );


        if (result.rows.length === 0) {

            return res.status(403).send(
                "You are not allowed to update this job."
            );

        }


        res.redirect("/jobs");


    } catch (err) {

        console.error(
            "Update Job Error:",
            err
        );

        res.status(500).send(
            "Unable to update job: " + err.message
        );

    }

};



// DELETE JOB
// POST /jobs/delete/:id


exports.deleteJob = async (req, res) => {

    try {

        if (!req.session.user) {
            return res.redirect("/auth/login");
        }


      

        const result = await db.query(

            `DELETE FROM jobs

             WHERE id = $1
             AND created_by = $2

             RETURNING id`,

            [
                req.params.id,
                req.session.user.id
            ]

        );


        if (result.rows.length === 0) {

            return res.status(403).send(
                "You are not allowed to delete this job."
            );

        }


        res.redirect("/jobs");


    } catch (err) {

        console.error(
            "Delete Job Error:",
            err
        );

        res.status(500).send(
            "Unable to delete job: " + err.message
        );

    }

};



// VIEW SINGLE JOB
// GET /jobs/:id


exports.getJobById = async (req, res) => {

    try {

        const result = await db.query(

            `SELECT
                jobs.*,
                users.name AS posted_by

             FROM jobs

             LEFT JOIN users
             ON users.id = jobs.created_by

             WHERE jobs.id = $1`,

            [
                req.params.id
            ]

        );


        if (result.rows.length === 0) {

            return res.status(404).send(
                "Job not found."
            );

        }


        res.render(

            "jobs/jobDetails",

            {
                job: result.rows[0],
                user: req.session.user
            }

        );


    } catch (err) {

        console.error(
            "Get Job By ID Error:",
            err
        );

        res.status(500).send(
            "Unable to load job: " + err.message
        );

    }

};