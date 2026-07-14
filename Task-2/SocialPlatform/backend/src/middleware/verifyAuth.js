const { verifyToken } = require("../utils/jwt");

function verifyAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization required."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = verifyToken(token);
        req.user = payload;
        return next();
    } catch (err) {
        console.error("Auth verification failed", err.message);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}

module.exports = verifyAuth;
