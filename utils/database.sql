BEGIN;

CREATE TABLE users (
    userID SERIAL PRIMARY KEY, 
    userName VARCHAR(50) NOT NULL, 
    email VARCHAR(75) NOT NULL UNIQUE, 
    phoneNo VARCHAR(10) NOT NULL UNIQUE, 
    address VARCHAR(75), 
    password TEXT NOT NULL, 
    createdOn DATE DEFAULT (DATE(NOW()))
    );

CREATE TABLE audios (
    audioID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    Name VARCHAR(50) NOT NULL, 
    uri TEXT NOT NULL, 
    cover_pic_url TEXT, 
    description TEXT,  
    uploadedOn DATE DEFAULT (DATE(NOW())), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
    );

CREATE TABLE artists (
    artistID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    stage_name VARCHAR(50),   
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
    );

CREATE TABLE payments (
    payID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    artistID INT NOT NULL, 
    amount DECIMAL(10, 2) NOT NULL,  
    date DATE DEFAULT (DATE(NOW())), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE, 
    FOREIGN KEY (artistID) REFERENCES artists(artistID) ON DELETE CASCADE
    );

CREATE TABLE comments ( 
    commentID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    audioID INT NOT NULL, 
    comment TEXT NOT NULL, 
    date DATE DEFAULT (DATE(NOW())), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE, 
    FOREIGN KEY (audioID) REFERENCES audios(audioID) ON DELETE CASCADE
    );

CREATE TABLE likes (    
    likeID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    audioID INT NOT NULL, 
    date DATE DEFAULT (DATE(NOW())), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE, 
    FOREIGN KEY (audioID) REFERENCES audios(audioID) ON DELETE CASCADE
    );

CREATE TABLE follows (
    followID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    artistID INT NOT NULL, 
    date DATE DEFAULT (DATE(NOW())), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE, 
    FOREIGN KEY (artistID) REFERENCES artists(artistID) ON DELETE CASCADE
    );

CREATE TABLE playlists (
    playlistID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    Name VARCHAR(50) NOT NULL, 
    date DATE DEFAULT (DATE(NOW())), 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
    );

CREATE TABLE playlist_audios (
    playlist_audioID SERIAL PRIMARY KEY, 
    playlistID INT NOT NULL, 
    audioID INT NOT NULL, 
    FOREIGN KEY (playlistID) REFERENCES playlists(playlistID) ON DELETE CASCADE, 
    FOREIGN KEY (audioID) REFERENCES audios(audioID) ON DELETE CASCADE
    );

CREATE TABLE playlist_artists (
    playlist_artistID SERIAL PRIMARY KEY, 
    playlistID INT NOT NULL, 
    artistID INT NOT NULL, 
    FOREIGN KEY (playlistID) REFERENCES playlists(playlistID) ON DELETE CASCADE, 
    FOREIGN KEY (artistID) REFERENCES artists(artistID) ON DELETE CASCADE
    );

CREATE TABLE playlist_users (
    playlist_userID SERIAL PRIMARY KEY, 
    playlistID INT NOT NULL, 
    userID INT NOT NULL, 
    FOREIGN KEY (playlistID) REFERENCES playlists(playlistID) ON DELETE CASCADE, 
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
    );

CREATE TABLE genres (
    genreID SERIAL PRIMARY KEY, 
    genre VARCHAR(50) NOT NULL
    );

CREATE TABLE audio_genres ( 
    audio_genreID SERIAL PRIMARY KEY, 
    audioID INT NOT NULL, 
    genreID INT NOT NULL, 
    FOREIGN KEY (audioID) REFERENCES audios(audioID) ON DELETE CASCADE, 
    FOREIGN KEY (genreID) REFERENCES genres(genreID) ON DELETE CASCADE
    );


CREATE TABLE artist_genres (
    artist_genreID SERIAL PRIMARY KEY, 
    artistID INT NOT NULL, 
    genreID INT NOT NULL, 
    FOREIGN KEY (artistID) REFERENCES artists(artistID) ON DELETE CASCADE, 
    FOREIGN KEY (genreID) REFERENCES genres(genreID) ON DELETE CASCADE
    );

CREATE TABLE admin (
    adminID SERIAL PRIMARY KEY,
    adminName VARCHAR(50) NOT NULL,
    email VARCHAR(75) NOT NULL UNIQUE,
    phoneNo VARCHAR(10) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    createdOn DATE DEFAULT (DATE(NOW()))
);
CREATE TABLE admin_logs (
    logID SERIAL PRIMARY KEY,
    adminID INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    date DATE DEFAULT (DATE(NOW())),
    FOREIGN KEY (adminID) REFERENCES admin(admiinID) ON DELETE CASCADE
)

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(userid),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    blacklisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE TABLE content (
    contentID SERIAL PRIMARY KEY,
    userID INT NOT NULL,
    audioID INT,
    caption TEXT NOT NULL,
    vote INT DEFAULT 0,
    visibility VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
    FOREIGN KEY (audioID) REFERENCES audios(audioID) ON DELETE CASCADE
);




CREATE TABLE comments (
    commentID SERIAL PRIMARY KEY,
    contentID INTEGER NOT NULL,
    userID INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_edited BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (contentID) REFERENCES content(contentID) ON DELETE CASCADE,
    FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
);

-- Index for faster comment retrieval
CREATE INDEX idx_comments_content ON comments(contentID);




CREATE OR REPLACE FUNCTION update_comment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    NEW.is_edited = TRUE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER comment_timestamp
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_timestamp();


CREATE TABLE profiles (
    profileid SERIAL PRIMARY KEY,
    userid INTEGER REFERENCES users(userid),
    about TEXT,
    pic_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    soundcloud_url TEXT,
    youtube_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create follows table
CREATE TABLE follows (
    follow_id SERIAL PRIMARY KEY,
    follower_id INTEGER REFERENCES users(userid),
    followed_id INTEGER REFERENCES users(userid),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, followed_id)
);

-- Create notifications table
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(userid),
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    related_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMIT;