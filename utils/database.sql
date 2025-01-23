CREATE TABLE users (
    userID SERIAL PRIMARY KEY, 
    userName VARCHAR(50) NOT NULL, 
    email VARCHAR(75) NOT NULL, 
    phoneNo VARCHAR(10) NOT NULL, 
    address VARCHAR(75), 
    password TEXT NOT NULL, 
    createdOn DATE DEFAULT (DATE(NOW()))
    );

CREATE TABLE audios (
    audioID SERIAL PRIMARY KEY, 
    userID INT NOT NULL, 
    Name VARCHAR(50) NOT NULL, 
    uri TEXT NOT NULL, 
    cover_pic_uir TEXT, 
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

