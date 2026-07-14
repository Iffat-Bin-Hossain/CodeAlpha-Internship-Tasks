DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-------------------------------------------------------
-- USERS
-------------------------------------------------------

CREATE TABLE users (

    id SERIAL PRIMARY KEY,

    username VARCHAR(40) UNIQUE NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    profile_picture TEXT,

    cover_picture TEXT,

    bio TEXT,

    website VARCHAR(200),

    location VARCHAR(100),

    is_private BOOLEAN DEFAULT FALSE,

    is_verified BOOLEAN DEFAULT FALSE,

    ----------------------------------------------------

    email_verification_token TEXT,

    email_verification_expiry TIMESTAMP,

    ----------------------------------------------------

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- POSTS
-------------------------------------------------------

CREATE TABLE posts(

    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL REFERENCES users(id)
    ON DELETE CASCADE,

    content TEXT,

    image_url TEXT,

    video_url TEXT,

    link_url TEXT,

    visibility VARCHAR(20) DEFAULT 'public',

    total_likes INT DEFAULT 0,

    total_comments INT DEFAULT 0,

    total_shares INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- COMMENTS
-------------------------------------------------------

CREATE TABLE comments(

    id SERIAL PRIMARY KEY,

    post_id INT REFERENCES posts(id)
    ON DELETE CASCADE,

    user_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    parent_comment_id INT REFERENCES comments(id),

    comment TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- LIKES
-------------------------------------------------------

CREATE TABLE likes(

    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    post_id INT REFERENCES posts(id)
    ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id,post_id)
);

-------------------------------------------------------
-- FOLLOWS
-------------------------------------------------------

CREATE TABLE follows(

    id SERIAL PRIMARY KEY,

    follower_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    following_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(follower_id,following_id)
);

-------------------------------------------------------
-- SHARES
-------------------------------------------------------

CREATE TABLE shares(

    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    post_id INT REFERENCES posts(id)
    ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- NOTIFICATIONS
-------------------------------------------------------

CREATE TABLE notifications(

    id SERIAL PRIMARY KEY,

    receiver_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    sender_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    post_id INT REFERENCES posts(id)
    ON DELETE CASCADE,

    notification_type VARCHAR(50),

    message TEXT,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- CHAT ROOM
-------------------------------------------------------

CREATE TABLE chat_rooms(

    id SERIAL PRIMARY KEY,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- MESSAGE
-------------------------------------------------------

CREATE TABLE messages(

    id SERIAL PRIMARY KEY,

    room_id INT REFERENCES chat_rooms(id)
    ON DELETE CASCADE,

    sender_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    message TEXT,

    message_type VARCHAR(20) DEFAULT 'text',

    attachment_url TEXT,

    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-------------------------------------------------------
-- READ STATUS
-------------------------------------------------------

CREATE TABLE message_reads(

    id SERIAL PRIMARY KEY,

    message_id INT REFERENCES messages(id)
    ON DELETE CASCADE,

    user_id INT REFERENCES users(id)
    ON DELETE CASCADE,

    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(message_id,user_id)
);