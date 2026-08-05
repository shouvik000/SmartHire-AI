const express = require("express");
const path = require("path");
require("dotenv").config();

const db = require("./config/db");

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
    res.send("<h1>🚀 SmartHire AI Backend Running Successfully!</h1>");
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Server Running on http://localhost:${PORT}`);
});