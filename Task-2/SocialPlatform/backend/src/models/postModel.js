const pool = require("../config/db");

async function createPost(post) {
    const query = `
        INSERT INTO posts (
            user_id,
            content,
            image_url,
            video_url,
            link_url
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        post.user_id,
        post.content || null,
        post.image_url || null,
        post.video_url || null,
        post.link_url || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

async function getPostById(postId) {
    const query = `
        SELECT p.*, u.username, u.full_name, u.profile_picture
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.id = $1
    `;

    const result = await pool.query(query, [postId]);
    return result.rows[0];
}

async function getFeed(userId) {
    const query = `
        SELECT p.*, u.username, u.full_name, u.profile_picture,
               EXISTS (
                   SELECT 1 FROM likes l 
                   WHERE l.post_id = p.id AND l.user_id = $1
               ) AS is_liked
        FROM posts p
        JOIN users u ON u.id = p.user_id
        LEFT JOIN follows f
            ON f.following_id = p.user_id
            AND f.follower_id = $1
        WHERE p.visibility = 'public'
            AND (
                p.user_id = $1
                OR f.follower_id IS NOT NULL
            )
        ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function getPostsByUser(userId) {
    const query = `
        SELECT p.*, u.username, u.full_name, u.profile_picture,
               EXISTS (
                   SELECT 1 FROM likes l 
                   WHERE l.post_id = p.id AND l.user_id = $1
               ) AS is_liked
        FROM posts p
        JOIN users u ON u.id = p.user_id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function likePost(postId, userId) {
    const query = `
        INSERT INTO likes (user_id, post_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, post_id)
        DO NOTHING
        RETURNING *
    `;

    const result = await pool.query(query, [userId, postId]);
    return result.rows[0];
}

async function unlikePost(postId, userId) {
    const query = `
        DELETE FROM likes
        WHERE user_id = $1
            AND post_id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [userId, postId]);
    return result.rows[0];
}

async function addComment(postId, userId, comment) {
    const query = `
        INSERT INTO comments (post_id, user_id, comment)
        VALUES ($1, $2, $3)
        RETURNING *
    `;

    const result = await pool.query(query, [postId, userId, comment]);
    return result.rows[0];
}

async function addShare(postId, userId) {
    const query = `
        INSERT INTO shares (user_id, post_id)
        VALUES ($1, $2)
        RETURNING *
    `;

    const result = await pool.query(query, [userId, postId]);
    return result.rows[0];
}

async function incrementPostCount(postId, columnName, client = pool) {
    const query = `
        UPDATE posts
        SET ${columnName} = COALESCE(${columnName}, 0) + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, total_likes, total_comments, total_shares
    `;

    const result = await client.query(query, [postId]);
    return result.rows[0];
}

async function decrementPostCount(postId, columnName, client = pool) {
    const query = `
        UPDATE posts
        SET ${columnName} = GREATEST(COALESCE(${columnName}, 0) - 1, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, total_likes, total_comments, total_shares
    `;

    const result = await client.query(query, [postId]);
    return result.rows[0];
}

async function getCommentsByPost(postId) {
    const query = `
        SELECT c.*, u.username, u.full_name, u.profile_picture
        FROM comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.post_id = $1
        ORDER BY c.created_at ASC
    `;

    const result = await pool.query(query, [postId]);
    return result.rows;
}

async function getNotifications(userId) {
    const query = `
        SELECT n.*, u.username AS sender_username, u.full_name AS sender_full_name, p.content AS post_content
        FROM notifications n
        JOIN users u ON u.id = n.sender_id
        LEFT JOIN posts p ON p.id = n.post_id
        WHERE n.receiver_id = $1
        ORDER BY n.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function markNotificationRead(notificationId, userId) {
    const query = `
        UPDATE notifications
        SET is_read = TRUE
        WHERE id = $1
            AND receiver_id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [notificationId, userId]);
    return result.rows[0];
}

async function createNotification(notification) {
    const query = `
        INSERT INTO notifications (
            receiver_id,
            sender_id,
            post_id,
            notification_type,
            message
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        notification.receiver_id,
        notification.sender_id,
        notification.post_id,
        notification.notification_type,
        notification.message
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
}

module.exports = {
    createPost,
    getPostById,
    getFeed,
    getPostsByUser,
    likePost,
    unlikePost,
    addComment,
    addShare,
    incrementPostCount,
    decrementPostCount,
    getCommentsByPost,
    getNotifications,
    markNotificationRead,
    createNotification
};
