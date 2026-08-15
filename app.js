const express = require("express");
const path = require("path");
const session = require("express-session");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const { isLoggedIn } = require("./middleware/authMiddleware");

const app = express();


// ==========================================
// DATABASE CONNECTION TEST
// ==========================================

db.query("SELECT NOW()")
    .then(() => {
        console.log(" PostgreSQL Connected");
    })
    .catch((err) => {
        console.error(
            " Database Error:",
            err.message
        );
    });


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());


// ==========================================
// SESSION
// IMPORTANT: MUST COME BEFORE ROUTES
// ==========================================

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
);


// ==========================================
// VIEW ENGINE
// ==========================================

app.set("view engine", "ejs");

app.set(
    "views",
    path.join(__dirname, "views")
);


// ==========================================
// STATIC FILES
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ==========================================
// RESUME UPLOADS
// ==========================================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ==========================================
// HOME PAGE
// ==========================================

app.get("/", (req, res) => {

    res.render("index");

});


// ==========================================
// DATABASE TEST
// ==========================================

app.get("/db-test", async (req, res) => {

    try {

        const result = await db.query(
            "SELECT NOW()"
        );

        res.json({

            success: true,

            serverTime:
                result.rows[0].now

        });

    } catch (err) {

        console.error(
            "Database Test Error:",
            err
        );

        res.status(500).json({

            success: false,

            message: err.message

        });

    }

});


// ==========================================
// DASHBOARD
// ==========================================

app.get(
    "/dashboard",
    isLoggedIn,
    async (req, res) => {

        try {

            // Total Jobs
            const totalJobs =
                await db.query(
                    "SELECT COUNT(*) FROM jobs"
                );


            // Total Users
            const totalUsers =
                await db.query(
                    "SELECT COUNT(*) FROM users"
                );


            // Total Applications
            const totalApplications =
                await db.query(
                    "SELECT COUNT(*) FROM applications"
                );


            // Render Dashboard
            res.render(
                "dashboard",
                {

                    user:
                        req.session.user,

                    totalJobs:
                        totalJobs.rows[0].count,

                    totalUsers:
                        totalUsers.rows[0].count,

                    totalApplications:
                        totalApplications.rows[0].count

                }
            );

        } catch (err) {

            console.error(
                "Dashboard Error:",
                err
            );

            res.status(500).send(
                "Unable to load dashboard."
            );

        }

    }
);


// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use(
    "/",
    authRoutes
);


// ==========================================
// JOB ROUTES
// ==========================================

app.use(
    "/jobs",
    jobRoutes
);


// ==========================================
// APPLICATION ROUTES
// ==========================================

app.use(
    "/",
    applicationRoutes
);


// ==========================================
// 404 PAGE
// ==========================================

app.use((req, res) => {

    res.status(404).send(`

        <div style="
            font-family: Arial;
            text-align: center;
            margin-top: 100px;
        ">

            <h1>404</h1>

            <h2>Page Not Found</h2>

            <p>
                The page you are looking for
                does not exist.
            </p>

            <a href="/">
                Go Home
            </a>

        </div>

    `);

});


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            ` Server Running on http://localhost:${PORT}`
        );

    }
);