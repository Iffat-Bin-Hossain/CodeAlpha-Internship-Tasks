const postModel = require("../models/postModel");

function getNotificationMessage(type, actorName) {
    if (type === "like") return `${actorName} liked your post.`;
    if (type === "comment") return `${actorName} commented on your post.`;
    if (type === "share") return `${actorName} shared your post.`;
    return `${actorName} interacted with your post.`;
}

async function createPost(req, res) {
    try {
        const { content, image_url, video_url, link_url } = req.body;
        const userId = req.user.id;

        if (!content && !image_url && !video_url && !link_url) {
            return res.status(400).json({
                success: false,
                message: "Post must include text, an image URL, a video URL, or a link."
            });
        }

        const post = await postModel.createPost({
            user_id: userId,
            content,
            image_url,
            video_url,
            link_url
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully.",
            post
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function getFeed(req, res) {
    try {
        const posts = await postModel.getFeed(req.user.id);
        return res.status(200).json({
            success: true,
            posts
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function getMyPosts(req, res) {
    try {
        const userId = req.user.id;
        const posts = await postModel.getPostsByUser(userId);
        return res.status(200).json({
            success: true,
            posts
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}

async function likePost(req, res) {
    try {
        const postId = Number(req.params.postId);
        const userId = req.user.id;

        if (!Number.isInteger(postId) || postId <= 0) {
            return res.status(400).json({ success: false, message: "Invalid post id." });
        }

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found." });
        }

        const existing = await postModel.likePost(postId, userId);

        if (!existing) {
            return res.status(200).json({ success: true, message: "Post already liked." });
        }

        await postModel.incrementPostCount(postId, "total_likes");

        if (post.user_id !== userId) {
            const actorName = req.user.username || "Someone";
            await postModel.createNotification({
                receiver_id: post.user_id,
                sender_id: userId,
                post_id: postId,
                notification_type: "like",
                message: getNotificationMessage("like", actorName)
            });
        }

        return res.status(200).json({ success: true, message: "Post liked successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function unlikePost(req, res) {
    try {
        const postId = Number(req.params.postId);
        const userId = req.user.id;

        const removed = await postModel.unlikePost(postId, userId);
        if (removed) {
            await postModel.decrementPostCount(postId, "total_likes");
        }

        return res.status(200).json({ success: true, message: "Post unliked successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function commentPost(req, res) {
    try {
        const postId = Number(req.params.postId);
        const userId = req.user.id;
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: "Comment text is required." });
        }

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found." });
        }

        const createdComment = await postModel.addComment(postId, userId, comment.trim());
        await postModel.incrementPostCount(postId, "total_comments");

        if (post.user_id !== userId) {
            const actorName = req.user.username || "Someone";
            await postModel.createNotification({
                receiver_id: post.user_id,
                sender_id: userId,
                post_id: postId,
                notification_type: "comment",
                message: getNotificationMessage("comment", actorName)
            });
        }

        return res.status(201).json({
            success: true,
            message: "Comment added successfully.",
            comment: createdComment
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function sharePost(req, res) {
    try {
        const postId = Number(req.params.postId);
        const userId = req.user.id;

        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found." });
        }

        await postModel.addShare(postId, userId);
        await postModel.incrementPostCount(postId, "total_shares");

        if (post.user_id !== userId) {
            const actorName = req.user.username || "Someone";
            await postModel.createNotification({
                receiver_id: post.user_id,
                sender_id: userId,
                post_id: postId,
                notification_type: "share",
                message: getNotificationMessage("share", actorName)
            });
        }

        return res.status(201).json({ success: true, message: "Post shared successfully." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function getPostComments(req, res) {
    try {
        const postId = Number(req.params.postId);
        const comments = await postModel.getCommentsByPost(postId);
        return res.status(200).json({ success: true, comments });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function getNotifications(req, res) {
    try {
        const notifications = await postModel.getNotifications(req.user.id);
        return res.status(200).json({ success: true, notifications });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

async function markNotificationRead(req, res) {
    try {
        const notificationId = Number(req.params.notificationId);
        const notification = await postModel.markNotificationRead(notificationId, req.user.id);

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found." });
        }

        return res.status(200).json({ success: true, message: "Notification marked as read." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
}

module.exports = {
    createPost,
    getFeed,
    getMyPosts,
    likePost,
    unlikePost,
    commentPost,
    sharePost,
    getPostComments,
    getNotifications,
    markNotificationRead
};
