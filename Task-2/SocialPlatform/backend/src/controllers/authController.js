const userModel = require("../models/userModel");

const {
    hashPassword,
    comparePassword
} = require("../utils/password");

const {
    generateToken
} = require("../utils/jwt");

const {
    generateVerificationToken,
    tokenExpiry
} = require("../utils/token");

const {
    sendVerificationEmail
} = require("../services/emailService");
/*
==================================
Register
POST /api/auth/register
==================================
*/

async function register(req, res) {

    try {

        const {
            username,
            full_name,
            email,
            password,
            bio
        } = req.body;

        // Validation
        if (!username || !full_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }

        // Email already exists?
        const emailExists = await userModel.findByEmail(email);

        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: "Email already exists."
            });
        }

        // Username already exists?
        const usernameExists = await userModel.findByUsername(username);

        if (usernameExists) {
            return res.status(409).json({
                success: false,
                message: "Username already exists."
            });
        }

        // Hash password
        const password_hash = await hashPassword(password);

        const verificationToken =
            generateVerificationToken();

        const expiry =
            tokenExpiry();

        const user = await userModel.createUser({

            username,

            full_name,

            email,

            password_hash,

            bio: bio || "",

            email_verification_token:
                verificationToken,

            email_verification_expiry:
                expiry

        });
        try {
            await sendVerificationEmail(
                { email, full_name },
                verificationToken
            );
        } catch (emailErr) {
            console.log("Email could not be sent, ignoring:", emailErr.message);
        }

        return res.status(201).json({
            success: true,
            message: "Registration successful. Please check your email to verify your account.",
            user
        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    }

}

/*
==================================
Login
POST /api/auth/login
==================================
*/

async function login(req, res) {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password required."
            });

        }

        const user = await userModel.findUserByEmail(email);

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });

        }

        const matched = await comparePassword(password, user.password_hash);

        if (!matched) {

            return res.status(401).json({
                success: false,
                message: "Invalid credentials."
            });

        }

        const token = generateToken(user);

        return res.status(200).json({

            success: true,
            message: "Login successful.",

            token,

            user: {

                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email

            }

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    }

}

async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: "Verification token is required."
            });
        }

        const user = await userModel.findByVerificationToken(token);

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification token."
            });
        }

        if (user.is_verified) {
            return res.status(200).json({
                success: true,
                message: "Email is already verified."
            });
        }

        if (new Date(user.email_verification_expiry) < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Verification token has expired."
            });
        }

        await userModel.verifyEmail(user.id);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully."
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

module.exports = {

    register,
    login,
    verifyEmail

};