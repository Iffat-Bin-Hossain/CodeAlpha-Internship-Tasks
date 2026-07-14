const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/*
=========================================
Send Email Verification Link
=========================================
*/

async function sendVerificationEmail(user, token) {

    const verificationLink =
        `${process.env.BACKEND_URL}/api/auth/verify-email?token=${token}`;

    const mailOptions = {

        from: `"Social Platform" <${process.env.EMAIL_USER}>`,

        to: user.email,

        subject: "Verify your Social Platform account",

        html: `
            <h2>Hello ${user.full_name},</h2>

            <p>Thank you for registering.</p>

            <p>Please click the button below to verify your email.</p>

            <a
                href="${verificationLink}"
                style="
                    background:#2563eb;
                    color:white;
                    padding:12px 20px;
                    text-decoration:none;
                    border-radius:5px;
                "
            >
                Verify Email
            </a>

            <br><br>

            <p>Or copy this link:</p>

            <p>${verificationLink}</p>

            <p>This link expires in 24 hours.</p>

            <p>If you did not create this account, simply ignore this email.</p>
        `
    };

    return transporter.sendMail(mailOptions);
}

module.exports = {
    sendVerificationEmail
};