const userModel = require("../models/userModel");

async function updateProfile(req, res) {
    try {
        const userId = req.user.id;
        const { full_name, bio, location, website, profile_picture, cover_picture } = req.body;

        const updatedUser = await userModel.updateProfile(userId, {
            full_name,
            bio,
            location,
            website,
            profile_picture,
            cover_picture
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                full_name: updatedUser.full_name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                profile_picture: updatedUser.profile_picture,
                cover_picture: updatedUser.cover_picture,
                location: updatedUser.location,
                website: updatedUser.website
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function getAllUsers(req, res) {
    try {
        const userId = req.user.id;
        const users = await userModel.getAllUsers(userId);
        return res.status(200).json({ success: true, users });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function getUserProfile(req, res) {
    try {
        const targetId = Number(req.params.id);
        if (!Number.isInteger(targetId)) {
            return res.status(400).json({ success: false, message: "Invalid user id." });
        }
        
        const user = await userModel.findById(targetId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                bio: user.bio,
                profile_picture: user.profile_picture,
                cover_picture: user.cover_picture,
                location: user.location,
                website: user.website,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function getCurrentUser(req, res) {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        
        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                email: user.email,
                bio: user.bio,
                profile_picture: user.profile_picture,
                cover_picture: user.cover_picture,
                location: user.location,
                website: user.website,
                created_at: user.created_at
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

module.exports = {
    updateProfile,
    getAllUsers,
    getUserProfile,
    getCurrentUser
};
