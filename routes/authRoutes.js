const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

// Register 
router.get("/register", authController.showRegister);
router.post("/register", authController.register);

// Login
router.get("/login", authController.showLogin);
router.post("/login", authController.login);

module.exports = router;