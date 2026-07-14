const userModel = require("../models/userModel");

async function followUser(req, res) {
    try {
        const followingId = Number(req.params.userId);
        const followerId = req.user.id;

        if (!Number.isInteger(followingId) || followingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        if (followingId === followerId) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself."
            });
        }

        const relation = await userModel.followUser(followerId, followingId);

        return res.status(200).json({
            success: true,
            message: relation ? "User followed successfully." : "Already following this user."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function unfollowUser(req, res) {
    try {
        const followingId = Number(req.params.userId);
        const followerId = req.user.id;

        if (!Number.isInteger(followingId) || followingId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user id."
            });
        }

        await userModel.unfollowUser(followerId, followingId);

        return res.status(200).json({
            success: true,
            message: "User unfollowed successfully."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function getFollowing(req, res) {
    try {
        const following = await userModel.getFollowing(req.user.id);

        return res.status(200).json({
            success: true,
            following
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
    followUser,
    unfollowUser,
    getFollowing
};