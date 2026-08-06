const express = require("express");
const path = require("path");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();

const db = require("./config/db");
db.query("SELECT NOW()")
  .then(() => console.log("✅ PostgreSQL Connected"))
  .catch(err => console.error("❌ Database Error:", err.message));

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static Files
app.use(express.static(path.join(__dirname, "public")));

// Home Route
app.get("/", (req, res) => {
    res.send(`
        <h1>🚀 SmartHire AI</h1>
        <h3>Backend Running Successfully</h3>
        <a href="/db-test">Test Database</a>
    `);
});

// Database Test Route

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);
app.use("/", authRoutes);
app.get("/db-test", async (req, res) => {
    try {
        const result = await db.query("SELECT NOW()");
        res.json({
            success: true,
            serverTime: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server Running on http://localhost:${PORT}`);
});