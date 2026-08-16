const db = require("../config/db");
const bcrypt = require("bcrypt");

exports.showRegister = (req, res) => {
    res.render("auth/register");
};

exports.showLogin = (req, res) => {
    res.render("auth/login");
};

// Show Register Page
exports.showRegister = (req, res) => {
    res.render("auth/register");
};

// Show Login Page
exports.showLogin = (req, res) => {
    res.render("auth/login");
};

// Register User
exports.register = async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.send("All fields are required");
        }

        // Check Existing User
        const user = await db.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length > 0) {
            return res.send("Email already exists");
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users(name,email,password)
             VALUES($1,$2,$3)`,
            [name, email, hashedPassword]
        );

        res.redirect("/login");

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }

};


// Login User
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        const result = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.send("User not found");
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send("Invalid Password");
        }

        // Create Session
        req.session.user = {
            id: user.id,
            name: user.name,
            role: user.role
        };

        res.redirect("/dashboard");

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
};

// LOGOUT


exports.logout = (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            console.error("Logout Error:", err);

            return res.status(500).send(
                "Unable to logout."
            );

        }

        // Remove session cookie
        res.clearCookie("connect.sid");

        // Redirect to login page
        res.redirect("/login");

    });

};