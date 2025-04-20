const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const { pool } = require("../config/dbConfig");
const { JWTverification } = require("../middlewares/verifyJWT");
const mm = require("music-metadata");
const NodeID3 = require("node-id3");
const fs = require("fs").promises;
const WaveformData = require("waveform-data");
const { message } = require("statuses");
const table = require("../config/queries.json");

// Configure ffmpeg
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

// Configure multer for file upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/audio");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = [".mp3", ".mp4", ".wav", ".m4a"];
	const ext = path.extname(file.originalname).toLowerCase();
	if (allowedTypes.includes(ext)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type"), false);
	}
};

const upload = multer({
	storage: storage,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
	fileFilter: fileFilter,
});

// Function to convert video to audio
async function convertToAudio(inputPath, outputPath) {
	return new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.toFormat("mp3")
			.on("end", () => resolve(outputPath))
			.on("error", (err) => reject(err))
			.save(outputPath);
	});
}

router.get("/", JWTverification, async (req, res) => {
	console.log("asd");
	res.json({
		message: "aayo",
	});
});

// Create post
router.post(
	"/create",
	JWTverification,
	upload.single("audio"),
	async (req, res) => {
		try {
			console.log("in post content");
			const { title, description, caption, visibility } = req.body;

			const userID = req.user.id; // Assuming JWTverification middleware adds user to req

			// Check if premium content is allowed for this user
			if (visibility === "premium") {
				const artistCheck = await pool.query(
					"SELECT verification_status FROM artists WHERE userID = $1",
					[userID]
				);

				if (
					!artistCheck.rows.length ||
					artistCheck.rows[0].verification_status !== "approved"
				) {
					return res.status(403).json({
						message: "Only verified artists can post premium content",
					});
				}
			}

			let audioPath = null;
			let metadata = {};

			// console.log("post content req", req);

			if (req.file) {
				console.log("audio post");
				audioPath = req.file.path;
				const ext = path.extname(req.file.originalname).toLowerCase();

				// Extract metadata from audio file
				metadata = await mm.parseFile(audioPath);

				// Convert video if needed
				if (ext === ".mp4") {
					const outputPath = audioPath.replace(".mp4", ".mp3");
					audioPath = await convertToAudio(audioPath, outputPath);
				}

				// Write ID3 tags
				const tags = {
					title: title || metadata.common.title,
					artist: metadata.common.artist,
					album: metadata.common.album,
					description: description,
				};
				NodeID3.write(tags, audioPath);

				// Create audio entry with metadata
				const audioResult = await pool.query(table.CREATE_AUDIO, [
					userID,
					title || metadata.common.title,
					audioPath,
					req.body.coverPicUrl || null,
					description,
				]);

				console.log("audioId ko", audioResult);
				
				// Create content entry with audio
				const contentResult = await pool.query(table.CREATE_POST, [
					userID,
					audioResult.rows[0].audioid,
					caption,
					visibility,
				]);

				res.json({
					status: 200,
					message: "Post created successfully",
					postID: contentResult.rows[0].postID,
				});
			} else {
				console.log("caption post");

				// Create content entry without audio (text-only post)
				const contentResult = await pool.query(table.CREATE_POST, [
					userID,
					null,
					caption,
					visibility,
				]);

				res.json({
					status: 200,
					message: "Text post created successfully",
					contentID: contentResult.rows[0].contentID,
				});
			}
		} catch (error) {
			res.status(500).json({
				status: 500,
				message: error.message,
			});
		}
	}
);

// Edit post (caption only)
router.put("/edit/:contentID", JWTverification, async (req, res) => {
	try {
		const { caption } = req.body;
		const { contentID } = req.params;
		const userID = req.user.id;

		await pool.query(table.UPDATE_POST, [caption, contentID, userID]);
		res.json({
			status: 200,
			message: "Post updated successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

// Delete post
router.delete("/delete/:contentID", JWTverification, async (req, res) => {
	try {
		const { contentID } = req.params;
		const userID = req.user.id;

		await pool.query(table.DELETE_POST, [contentID, userID]);
		res.json({
			status: 200,
			message: "Post deleted successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

// Upvote post
router.post("/upvote/:contentID", JWTverification, async (req, res) => {
	try {
		const { contentID } = req.params;
		await pool.query(table.UPDATE_VOTE, [contentID]);
		res.json({
			status: 200,
			message: "Post up voted successfully",
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

// Share post (returns post details for sharing)
router.get("/share/:contentID", async (req, res) => {
	try {
		const { contentID } = req.params;
		const result = await pool.query(table.GET_POST, [contentID]);

		if (result.rows.length === 0) {
			return res.status(404).json({
				status: 404,
				message: "Post not found",
			});
		}

		res.json({
			status: 200,
			post: result.rows[0],
		});
	} catch (error) {
		res.status(500).json({
			status: 500,
			message: error.message,
		});
	}
});

// Add new route for audio streaming
router.get("/stream/:audioID", async (req, res) => {
	try {
		const { audioID } = req.params;
		const audioResult = await pool.query(
			"SELECT uri FROM audio WHERE audioID = $1",
			[audioID]
		);

		if (!audioResult.rows.length) {
			return res.status(404).json({ message: "Audio not found" });
		}

		const audioPath = audioResult.rows[0].uri;
		const stat = await fs.stat(audioPath);
		const range = req.headers.range;

		if (range) {
			const parts = range.replace(/bytes=/, "").split("-");
			const start = parseInt(parts[0], 10);
			const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
			const chunksize = end - start + 1;
			const file = fs.createReadStream(audioPath, { start, end });

			res.writeHead(206, {
				"Content-Range": `bytes ${start}-${end}/${stat.size}`,
				"Accept-Ranges": "bytes",
				"Content-Length": chunksize,
				"Content-Type": "audio/mpeg",
			});
			file.pipe(res);
		} else {
			res.writeHead(200, {
				"Content-Length": stat.size,
				"Content-Type": "audio/mpeg",
			});
			fs.createReadStream(audioPath).pipe(res);
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add route to get audio metadata
router.get("/metadata/:audioID", async (req, res) => {
	try {
		const { audioID } = req.params;
		const audioResult = await pool.query(
			"SELECT uri FROM audio WHERE audioID = $1",
			[audioID]
		);

		if (!audioResult.rows.length) {
			return res.status(404).json({ message: "Audio not found" });
		}

		const metadata = await mm.parseFile(audioResult.rows[0].uri);
		res.json({
			status: 200,
			metadata: {
				title: metadata.common.title,
				artist: metadata.common.artist,
				album: metadata.common.album,
				duration: metadata.format.duration,
				bitrate: metadata.format.bitrate,
				format: metadata.format.container,
			},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Generate waveform data for audio visualization
async function generateWaveform(audioPath) {
	return new Promise((resolve, reject) => {
		ffmpeg(audioPath)
			.toFormat("wav")
			.on("error", reject)
			.pipe(
				new WaveformData.WaveformDataGenerator({
					audio: {
						channels: 1,
						sampleRate: 44100,
					},
					samples: 1000,
				})
			)
			.on("complete", resolve);
	});
}


// Get waveform data
router.get("/waveform/:audioID", async (req, res) => {
	try {
		const { audioID } = req.params;
		const result = await pool.query(
			"SELECT waveform FROM audio WHERE audioID = $1",
			[audioID]
		);

		if (!result.rows.length) {
			return res.status(404).json({ message: "Audio not found" });
		}

		res.json({
			status: 200,
			waveform: result.rows[0].waveform,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create playlist
router.post("/playlist/create", JWTverification, async (req, res) => {
	try {
		const { name, description } = req.body;
		const userID = req.user.id;

		const result = await pool.query(
			"INSERT INTO playlists (userID, name, description) VALUES ($1, $2, $3) RETURNING playlistID",
			[userID, name, description]
		);

		res.json({
			status: 200,
			message: "Playlist created successfully",
			playlistID: result.rows[0].playlistID,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add track to playlist
router.post("/playlist/:playlistID/add", JWTverification, async (req, res) => {
	try {
		const { playlistID } = req.params;
		const { contentID } = req.body;
		const userID = req.user.id;

		// Verify playlist ownership
		const playlistCheck = await pool.query(
			"SELECT userID FROM playlists WHERE playlistID = $1",
			[playlistID]
		);

		if (!playlistCheck.rows.length || playlistCheck.rows[0].userID !== userID) {
			return res.status(403).json({ message: "Unauthorized" });
		}

		await pool.query(
			"INSERT INTO playlist_tracks (playlistID, contentID) VALUES ($1, $2)",
			[playlistID, contentID]
		);

		res.json({
			status: 200,
			message: "Track added to playlist successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get playlist tracks
router.get("/playlist/:playlistID", async (req, res) => {
	try {
		const { playlistID } = req.params;
		const result = await pool.query(
			`
            SELECT c.*, a.* 
            FROM playlist_tracks pt 
            JOIN content c ON pt.contentID = c.contentID 
            LEFT JOIN audio a ON c.audioID = a.audioID 
            WHERE pt.playlistID = $1
            ORDER BY pt.added_at ASC`,
			[playlistID]
		);

		res.json({
			status: 200,
			tracks: result.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Search posts and audio
router.get("/search", async (req, res) => {
	try {
		const { query, type } = req.query;
		let searchResult;

		if (type === "audio") {
			searchResult = await pool.query(
				`
                SELECT * FROM audio 
                WHERE name ILIKE $1 OR description ILIKE $1
                ORDER BY timestamp DESC`,
				[`%${query}%`]
			);
		} else {
			searchResult = await pool.query(
				`
                SELECT c.*, a.name, a.uri, u.username 
                FROM content c 
                LEFT JOIN audio a ON c.audioID = a.audioID 
                JOIN users u ON c.userID = u.userID
                WHERE (a.name ILIKE $1 OR c.caption ILIKE $1)
                ORDER BY c.timestamp DESC`,
				[`%${query}%`]
			);
		}

		res.json({
			status: 200,
			results: searchResult.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add comment
router.post("/comment/:contentID", JWTverification, async (req, res) => {
	try {
		const { contentID } = req.params;
		const { comment } = req.body;
		const userID = req.user.id;

		const result = await pool.query(
			"INSERT INTO comments (contentID, userID, comment_text) VALUES ($1, $2, $3) RETURNING *",
			[contentID, userID, comment]
		);

		res.json({
			status: 200,
			message: "Comment added successfully",
			comment: result.rows[0],
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get comments for a post
router.get("/comments/:contentID", async (req, res) => {
	try {
		const { contentID } = req.params;
		const comments = await pool.query(
			`
            SELECT c.*, u.username 
            FROM comments c
            JOIN users u ON c.userID = u.userID
            WHERE c.contentID = $1
            ORDER BY c.created_at DESC`,
			[contentID]
		);

		res.json({
			status: 200,
			comments: comments.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Repost content
router.post("/repost/:contentID", JWTverification, async (req, res) => {
	try {
		const { contentID } = req.params;
		const userID = req.user.id;
		const { caption } = req.body;

		// Check if original post exists
		const originalPost = await pool.query(
			"SELECT * FROM content WHERE contentID = $1",
			[contentID]
		);
		if (!originalPost.rows.length) {
			return res.status(404).json({ message: "Original post not found" });
		}

		// Create repost
		const repost = await pool.query(
			"INSERT INTO reposts (original_contentID, userID, caption) VALUES ($1, $2, $3) RETURNING *",
			[contentID, userID, caption]
		);

		res.json({
			status: 200,
			message: "Content reposted successfully",
			repost: repost.rows[0],
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get public feed (non-premium, non-private posts)
router.get("/feed", async (req, res) => {
    try {
        const feed = await pool.query(`
            SELECT 
                c.contentID,
                c.caption,
                c.visibility,
                c.timestamp,
                c.vote as vote_count,
                a.audioID,
                a.title,
                a.description,
                a.uri as audio_url,
                a.cover_pic_url,
                u.userID,
                u.username,
                u.profile_pic_url,
                COUNT(cm.commentID) as comment_count
            FROM content c
            LEFT JOIN audio a ON c.audioID = a.audioID
            JOIN users u ON c.userID = u.userID
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            WHERE c.visibility = 'public'
            GROUP BY c.contentID, a.audioID, u.userID
            ORDER BY c.timestamp DESC
        `);

        res.json({
            status: 200,
            feed: feed.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's feed (posts, reposts, and followed users' content)
// router.get("/feed", JWTverification, async (req, res) => {
// 	try {
// 		const userID = req.user.id;
// 		const feed = await pool.query(
// 			`
//             SELECT 
//                 c.*, 
//                 a.name as audio_name, 
//                 a.uri as audio_uri,
//                 u.username,
//                 r.userID as reposted_by,
//                 ru.username as reposter_name
//             FROM content c
//             LEFT JOIN audio a ON c.audioID = a.audioID
//             JOIN users u ON c.userID = u.userID
//             LEFT JOIN reposts r ON c.contentID = r.original_contentID
//             LEFT JOIN users ru ON r.userID = ru.userID
//             WHERE c.userID = $1 
//                 OR c.userID IN (SELECT followed_id FROM follows WHERE follower_id = $1)
//                 OR r.userID = $1
//             ORDER BY c.timestamp DESC`,
// 			[userID]
// 		);

// 		res.json({
// 			status: 200,
// 			feed: feed.rows,
// 		});
// 	} catch (error) {
// 		res.status(500).json({ message: error.message });
// 	}
// });

// Audio processing - Adjust volume
router.post(
	"/audio/process/volume/:audioID",
	JWTverification,
	async (req, res) => {
		try {
			const { audioID } = req.params;
			const { volume } = req.body; // volume should be between 0 and 2
			const audioResult = await pool.query(
				"SELECT uri FROM audio WHERE audioID = $1",
				[audioID]
			);

			if (!audioResult.rows.length) {
				return res.status(404).json({ message: "Audio not found" });
			}

			const inputPath = audioResult.rows[0].uri;
			const outputPath = inputPath.replace(".mp3", "_processed.mp3");

			await new Promise((resolve, reject) => {
				ffmpeg(inputPath)
					.audioFilters(`volume=${volume}`)
					.save(outputPath)
					.on("end", resolve)
					.on("error", reject);
			});

			await pool.query("UPDATE audio SET uri = $1 WHERE audioID = $2", [
				outputPath,
				audioID,
			]);

			res.json({
				status: 200,
				message: "Audio volume adjusted successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Get user's post statistics
router.get("/stats/user/:userID", JWTverification, async (req, res) => {
	try {
		const { userID } = req.params;

		const stats = await pool.query(
			`
            SELECT 
                COUNT(DISTINCT c.contentID) as total_posts,
                COUNT(DISTINCT a.audioID) as total_audio_posts,
                SUM(c.vote) as total_votes,
                COUNT(DISTINCT r.repostID) as total_reposts,
                COUNT(DISTINCT cm.commentID) as total_comments_received,
                (
                    SELECT COUNT(*)
                    FROM comments
                    WHERE userID = $1
                ) as total_comments_made
            FROM content c
            LEFT JOIN audio a ON c.audioID = a.audioID
            LEFT JOIN reposts r ON c.contentID = r.original_contentID
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            WHERE c.userID = $1
            GROUP BY c.userID`,
			[userID]
		);

		// Get most popular posts
		const popularPosts = await pool.query(
			`
            SELECT c.*, a.name as audio_name, COUNT(cm.commentID) as comment_count
            FROM content c
            LEFT JOIN audio a ON c.audioID = a.audioID
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            WHERE c.userID = $1
            GROUP BY c.contentID, a.name
            ORDER BY c.vote DESC, comment_count DESC
            LIMIT 5`,
			[userID]
		);

		res.json({
			status: 200,
			statistics: stats.rows[0],
			topPosts: popularPosts.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get post engagement metrics
router.get("/stats/post/:contentID", JWTverification, async (req, res) => {
	try {
		const { contentID } = req.params;

		const engagement = await pool.query(
			`
            SELECT 
                c.contentID,
                c.vote as upvotes,
                COUNT(DISTINCT cm.commentID) as comment_count,
                COUNT(DISTINCT r.repostID) as repost_count,
                COUNT(DISTINCT pt.playlistID) as playlist_appearances
            FROM content c
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            LEFT JOIN reposts r ON c.contentID = r.original_contentID
            LEFT JOIN playlist_tracks pt ON c.contentID = pt.contentID
            WHERE c.contentID = $1
            GROUP BY c.contentID`,
			[contentID]
		);

		res.json({
			status: 200,
			engagement: engagement.rows[0],
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Audio processing - Add fade effects
router.post(
	"/audio/process/fade/:audioID",
	JWTverification,
	async (req, res) => {
		try {
			const { audioID } = req.params;
			const { fadeIn, fadeOut } = req.body; // Duration in seconds
			const audioResult = await pool.query(
				"SELECT uri FROM audio WHERE audioID = $1",
				[audioID]
			);

			if (!audioResult.rows.length) {
				return res.status(404).json({ message: "Audio not found" });
			}

			const inputPath = audioResult.rows[0].uri;
			const outputPath = inputPath.replace(".mp3", "_fade.mp3");

			await new Promise((resolve, reject) => {
				let command = ffmpeg(inputPath);
				if (fadeIn) {
					command = command.audioFilters(`afade=t=in:st=0:d=${fadeIn}`);
				}
				if (fadeOut) {
					command = command.audioFilters(
						`afade=t=out:st=-${fadeOut}:d=${fadeOut}`
					);
				}
				command.save(outputPath).on("end", resolve).on("error", reject);
			});

			await pool.query("UPDATE audio SET uri = $1 WHERE audioID = $2", [
				outputPath,
				audioID,
			]);

			res.json({
				status: 200,
				message: "Fade effects added successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Audio processing - Apply equalizer
router.post(
	"/audio/process/equalizer/:audioID",
	JWTverification,
	async (req, res) => {
		try {
			const { audioID } = req.params;
			const { bass, mid, treble } = req.body; // Values in dB
			const audioResult = await pool.query(
				"SELECT uri FROM audio WHERE audioID = $1",
				[audioID]
			);

			if (!audioResult.rows.length) {
				return res.status(404).json({ message: "Audio not found" });
			}

			const inputPath = audioResult.rows[0].uri;
			const outputPath = inputPath.replace(".mp3", "_eq.mp3");

			await new Promise((resolve, reject) => {
				ffmpeg(inputPath)
					.audioFilters([
						`equalizer=f=100:width_type=o:width=2:g=${bass}`, // Bass
						`equalizer=f=1000:width_type=o:width=2:g=${mid}`, // Mid
						`equalizer=f=8000:width_type=o:width=2:g=${treble}`, // Treble
					])
					.save(outputPath)
					.on("end", resolve)
					.on("error", reject);
			});

			await pool.query("UPDATE audio SET uri = $1 WHERE audioID = $2", [
				outputPath,
				audioID,
			]);

			res.json({
				status: 200,
				message: "Equalizer applied successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Audio processing - Speed adjustment
router.post(
	"/audio/process/speed/:audioID",
	JWTverification,
	async (req, res) => {
		try {
			const { audioID } = req.params;
			const { speed } = req.body; // Speed multiplier (0.5 to 2.0)
			const audioResult = await pool.query(
				"SELECT uri FROM audio WHERE audioID = $1",
				[audioID]
			);

			if (!audioResult.rows.length) {
				return res.status(404).json({ message: "Audio not found" });
			}

			const inputPath = audioResult.rows[0].uri;
			const outputPath = inputPath.replace(".mp3", "_speed.mp3");

			await new Promise((resolve, reject) => {
				ffmpeg(inputPath)
					.audioFilters(`atempo=${speed}`)
					.save(outputPath)
					.on("end", resolve)
					.on("error", reject);
			});

			await pool.query("UPDATE audio SET uri = $1 WHERE audioID = $2", [
				outputPath,
				audioID,
			]);

			res.json({
				status: 200,
				message: "Speed adjusted successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

module.exports = router;
