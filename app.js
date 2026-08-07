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

// =======================
// Test Database
// =======================
db.query("SELECT NOW()")
    .then(() => console.log("✅ PostgreSQL Connected"))
    .catch(err => console.error("❌ Database Error:", err.message));

// =======================
// Middleware
// =======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// =======================
// View Engine
// =======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// =======================
// Static Files
// =======================
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// Home
// =======================
app.get("/", (req, res) => {
    res.render("index");
});

// =======================
// Database Test
// =======================
app.get("/db-test", async (req, res) => {

    try {

        const result = await db.query("SELECT NOW()");

        res.json({
            success: true,
            serverTime: result.rows[0].now
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }

});

// =======================
// Dashboard
// =======================
app.get("/dashboard", isLoggedIn, async (req, res) => {

    try {

        const totalJobs = await db.query(
            "SELECT COUNT(*) FROM jobs"
        );

        const totalUsers = await db.query(
            "SELECT COUNT(*) FROM users"
        );

        const totalApplications = await db.query(
            "SELECT COUNT(*) FROM applications"
        );

        res.render("dashboard", {

            user: req.session.user,

            totalJobs: totalJobs.rows[0].count,

            totalUsers: totalUsers.rows[0].count,

            totalApplications: totalApplications.rows[0].count

        });

    } catch (err) {

        console.log(err);

        res.send(err.message);

    }

});

// =======================
// Routes
// =======================
app.use("/", authRoutes);

app.use("/jobs", jobRoutes);

app.use("/", applicationRoutes);

// =======================
// Server
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`✅ Server Running on http://localhost:${PORT}`);

});