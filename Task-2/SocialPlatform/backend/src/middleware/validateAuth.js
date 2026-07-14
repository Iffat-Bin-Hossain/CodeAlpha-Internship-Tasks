function validateRegister(req, res, next) {

    const {
        username,
        full_name,
        email,
        password
    } = req.body;

    if (!username || !full_name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "All required fields must be provided."
        });
    }

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email address."
        });
    }

    if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
            success: false,
            message: "Username must be between 3 and 30 characters."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: "Password must contain at least 8 characters."
        });
    }

    next();
}

function validateLogin(req, res, next) {

    const {
        email,
        password
    } = req.body;

    if (!email || !password) {

        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });

    }

    next();
}

module.exports = {

    validateRegister,

    validateLogin

};