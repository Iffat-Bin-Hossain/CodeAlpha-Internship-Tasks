const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const {
    validateRegister,
    validateLogin
} = require("../middleware/validateAuth");

const authLimiter = require("../middleware/authRateLimiter");

/*
===================================
PUBLIC ROUTES
===================================
*/

// Register

router.post(
    "/register",
    authLimiter,
    validateRegister,
    authController.register
);

// Login

router.post(
    "/login",
    authLimiter,
    validateLogin,
    authController.login
);

// Verify Email

router.get(
    "/verify-email",
    authController.verifyEmail
);

module.exports = router;