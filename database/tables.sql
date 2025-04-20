CREATE TABLE artists (
    artistID SERIAL PRIMARY KEY,
    userID INTEGER REFERENCES users(userid),
    verification_status VARCHAR(20) DEFAULT 'pending',
    verification_date TIMESTAMP,
    verified_by INTEGER REFERENCES users(userid),
    artist_bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(userID)
);
