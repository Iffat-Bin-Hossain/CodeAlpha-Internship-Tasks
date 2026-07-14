const express = require("express");
const router = express.Router();

const verifyAuth = require("../middleware/verifyAuth");
const postController = require("../controllers/postController");
const followController = require("../controllers/followController");
const userController = require("../controllers/userController");

// Posts
router.post("/posts", verifyAuth, postController.createPost);
router.get("/posts", verifyAuth, postController.getFeed);
router.get("/posts/me", verifyAuth, postController.getMyPosts);
router.post("/posts/:postId/like", verifyAuth, postController.likePost);
router.delete("/posts/:postId/like", verifyAuth, postController.unlikePost);
router.post("/posts/:postId/comments", verifyAuth, postController.commentPost);
router.get("/posts/:postId/comments", verifyAuth, postController.getPostComments);
router.post("/posts/:postId/share", verifyAuth, postController.sharePost);

// Follow graph
router.get("/posts/following", verifyAuth, followController.getFollowing);
router.post("/posts/follow/:userId", verifyAuth, followController.followUser);
router.delete("/posts/follow/:userId", verifyAuth, followController.unfollowUser);

// Notifications
router.get("/posts/notifications", verifyAuth, postController.getNotifications);
router.patch("/posts/notifications/:notificationId/read", verifyAuth, postController.markNotificationRead);

// Users
router.put("/users/profile", verifyAuth, userController.updateProfile);
router.get("/users/me", verifyAuth, userController.getCurrentUser);
router.get("/users/:id", verifyAuth, userController.getUserProfile);
router.get("/users", verifyAuth, userController.getAllUsers);

module.exports = router;
