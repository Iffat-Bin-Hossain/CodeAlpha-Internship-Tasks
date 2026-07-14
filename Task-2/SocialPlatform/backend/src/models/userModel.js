const pool = require("../config/db");

/*
=========================================
Find By Email
=========================================
*/

async function findByEmail(email) {

    const query = `
        SELECT *
        FROM users
        WHERE email = $1
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
}

/*
=========================================
Find By Username
=========================================
*/

async function findByUsername(username) {

    const query = `
        SELECT *
        FROM users
        WHERE username = $1
    `;

    const result = await pool.query(query, [username]);

    return result.rows[0];
}

/*
=========================================
Create User
=========================================
*/

async function createUser(user) {

    const query = `
        INSERT INTO users (

            username,

            full_name,

            email,

            password_hash,

            bio,

            email_verification_token,

            email_verification_expiry

        )

        VALUES ($1,$2,$3,$4,$5,$6,$7)

        RETURNING
        id,
        username,
        full_name,
        email,
        created_at
    `;

    const values = [

        user.username,

        user.full_name,

        user.email,

        user.password_hash,

        user.bio,

        user.email_verification_token,

        user.email_verification_expiry

    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

/*
=========================================
Find By Verification Token
=========================================
*/

async function findByVerificationToken(token) {

    const query = `
        SELECT *
        FROM users
        WHERE email_verification_token = $1
    `;

    const result = await pool.query(query, [token]);

    return result.rows[0];
}

/*
=========================================
Verify Email
=========================================
*/

async function verifyEmail(id) {

    const query = `
        UPDATE users

        SET

            is_verified = TRUE,

            email_verification_token = NULL,

            email_verification_expiry = NULL,

            updated_at = CURRENT_TIMESTAMP

        WHERE id = $1

        RETURNING
            id,
            username,
            email,
            is_verified
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

/*
=========================================
Find User By ID
=========================================
*/

async function findById(id) {

    const query = `
        SELECT

            id,

            username,

            full_name,

            email,

            bio,

            profile_picture,

            cover_picture,

            website,

            location,

            is_verified,

            created_at

        FROM users

        WHERE id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

/*
=========================================
Update Profile
=========================================
*/

async function updateProfile(id, user) {

    const query = `
        UPDATE users

        SET

            full_name=$1,

            bio=$2,

            website=$3,

            location=$4,

            profile_picture=$5,

            cover_picture=$6,

            updated_at=CURRENT_TIMESTAMP

        WHERE id=$7

        RETURNING *
    `;

    const values = [

        user.full_name,

        user.bio,

        user.website,

        user.location,

        user.profile_picture,

        user.cover_picture,

        id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

async function followUser(followerId, followingId) {
    const query = `
        INSERT INTO follows (
            follower_id,
            following_id
        )
        VALUES ($1, $2)
        ON CONFLICT (follower_id, following_id)
        DO NOTHING
        RETURNING *
    `;

    const result = await pool.query(query, [followerId, followingId]);
    return result.rows[0];
}

async function unfollowUser(followerId, followingId) {
    const query = `
        DELETE FROM follows
        WHERE follower_id = $1
            AND following_id = $2
        RETURNING *
    `;

    const result = await pool.query(query, [followerId, followingId]);
    return result.rows[0];
}

async function getFollowing(userId) {
    const query = `
        SELECT u.id, u.username, u.full_name, u.profile_picture
        FROM follows f
        JOIN users u ON u.id = f.following_id
        WHERE f.follower_id = $1
        ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
}

async function getAllUsers(excludeUserId) {
    const query = `
        SELECT u.id, u.username, u.full_name, u.profile_picture, u.bio,
               EXISTS (
                   SELECT 1 FROM follows f 
                   WHERE f.follower_id = $1 AND f.following_id = u.id
               ) AS is_following
        FROM users u
        WHERE u.id != $1
        ORDER BY RANDOM()
        LIMIT 10
    `;
    const result = await pool.query(query, [excludeUserId]);
    return result.rows;
}

module.exports = {

    createUser,

    findByEmail,

    findUserByEmail: findByEmail,

    findByUsername,

    findByVerificationToken,

    verifyEmail,

    findById,

    updateProfile,

    followUser,

    unfollowUser,

    getFollowing,

    getAllUsers

};