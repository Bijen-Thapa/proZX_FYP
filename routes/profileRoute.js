const express = require("express");
const router = express.Router();
const { pool } = require("../config/dbConfig");
const { JWTverification } = require("../middlewares/verifyJWT");
const multer = require("multer");
const path = require("path");

// Configure multer for profile picture upload
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "uploads/profiles");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + path.extname(file.originalname));
	},
});

const upload = multer({
	storage: storage,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
	fileFilter: (req, file, cb) => {
		const allowedTypes = [".jpg", ".jpeg", ".png"];
		const ext = path.extname(file.originalname).toLowerCase();
		if (allowedTypes.includes(ext)) {
			cb(null, true);
		} else {
			cb(new Error("Invalid file type"), false);
		}
	},
});

// Get user profile
router.get("/:userid", async (req, res) => {
	try {
		const { userid } = req.params;

		const profileData = await pool.query(
			`
            SELECT 
                u.userid,
                u.username,
                u.bio,
                u.profile_picture_url,
                u.is_verified,
                p.about,
                p.facebook_url,
                p.instagram_url,
                p.twitter_url,
                p.soundcloud_url,
                p.youtube_url,
                a.stage_name,
                a.artistid,
                (SELECT COUNT(*) FROM follows WHERE followed_id = u.userid) as followers_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = u.userid) as following_count,
                CASE 
                    WHEN f.follower_id IS NOT NULL THEN true 
                    ELSE false 
                END as is_following
            FROM users u
            LEFT JOIN profiles p ON u.userid = p.userid
            LEFT JOIN artists a ON u.userid = a.userid
            LEFT JOIN follows f ON u.userid = f.followed_id AND f.follower_id = $2
            WHERE u.userid = $1
        `,
			[userid, req.user?.id || null]
		);
		console.log("getprofile ma", profileData);

		if (!profileData.rows.length) {
			return res.status(404).json({ message: "Profile not found" });
		}

		console.log("profile ma post", profileData.rows[0].userid);
		// Get user's posts
		const posts = await pool.query(
			`
            SELECT 
                c.*,
                a.name as title,
                a.description,
                a.uri as audio_url,
                a.cover_pic_url,
                COUNT(cm.commentid) as comment_count
            FROM content c
            LEFT JOIN audios a ON c.audioid = a.audioid
            LEFT JOIN comments cm ON c.contentid = cm.contentid
            WHERE c.userid = $1
            GROUP BY c.contentid, a.audioid
            ORDER BY c.timestamp DESC
        `,
			[profileData.rows[0].userid]
		);

		console.log("profile ma post", posts);

		res.json({
			status: 200,
			profile: profileData.rows[0],
			posts: posts.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update profile
router.put(
	"/update",
	JWTverification,
	upload.single("profile_picture"),
	async (req, res) => {
		try {
			const userID = req.user.id;
			const {
				bio,
				about,
				facebook_url,
				instagram_url,
				twitter_url,
				soundcloud_url,
				youtube_url,
			} = req.body;

			// Update users table
			await pool.query(
				"UPDATE users SET bio = $1, profile_picture_url = $2 WHERE userid = $3",
				[bio, req.file?.path || req.body.profile_picture_url, userID]
			);

			// Update or insert profile
			await pool.query(
				`
            INSERT INTO profiles (
                userid, about, facebook_url, instagram_url, 
                twitter_url, soundcloud_url, youtube_url
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (userid) 
            DO UPDATE SET
                about = $2,
                facebook_url = $3,
                instagram_url = $4,
                twitter_url = $5,
                soundcloud_url = $6,
                youtube_url = $7,
                updated_at = CURRENT_TIMESTAMP
        `,
				[
					userID,
					about,
					facebook_url,
					instagram_url,
					twitter_url,
					soundcloud_url,
					youtube_url,
				]
			);

			res.json({
				status: 200,
				message: "Profile updated successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Follow/Unfollow user
router.post("/follow/:userID", JWTverification, async (req, res) => {
	try {
		const followerID = req.user.id;
		const followedID = req.params.userID;

		if (followerID === followedID) {
			return res.status(400).json({ message: "Cannot follow yourself" });
		}

		await pool.query("BEGIN");

		const existingFollow = await pool.query(
			"SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2",
			[followerID, followedID]
		);

		if (existingFollow.rows.length > 0) {
			await pool.query(
				"DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2",
				[followerID, followedID]
			);
			await pool.query("COMMIT");
			res.json({ status: 200, message: "Unfollowed successfully" });
		} else {
			await pool.query(
				"INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)",
				[followerID, followedID]
			);

			// Get follower's username for notification
			const followerData = await pool.query(
				"SELECT username FROM users WHERE userid = $1",
				[followerID]
			);

			// Create notification
			await pool.query(
				`INSERT INTO notifications (user_id, type, content, related_id)
                 VALUES ($1, 'follow', $2, $3)`,
				[
					followedID,
					`${followerData.rows[0].username} started following you`,
					followerID,
				]
			);

			await pool.query("COMMIT");
			res.json({ status: 200, message: "Followed successfully" });
		}
	} catch (error) {
		await pool.query("ROLLBACK");
		res.status(500).json({ message: error.message });
	}
});

// Update the get profile endpoint
router.get("/:userid", async (req, res) => {
	try {
		const { userid } = req.params;
		const currentUserID = req.user?.id;

		const profileData = await pool.query(
			`
            SELECT 
                u.userid,
                u.username,
                u.email,
                u.bio,
                u.profile_picture_url,
                u.is_verified,
                u.createdon,
                p.about,
                p.facebook_url,
                p.instagram_url,
                p.twitter_url,
                p.soundcloud_url,
                p.youtube_url,
                a.artistid,
                a.stage_name,
                (SELECT COUNT(*) FROM follows WHERE followed_id = u.userid) as followers_count,
                (SELECT COUNT(*) FROM follows WHERE follower_id = u.userid) as following_count,
                EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND followed_id = u.userid) as is_following
            FROM users u
            LEFT JOIN profiles p ON u.userid = p.userid
            LEFT JOIN artists a ON u.userid = a.userid
            WHERE u.userid = $1
        `,
			[userid, currentUserID]
		);

		if (!profileData.rows.length) {
			return res.status(404).json({ message: "Profile not found" });
		}

		// Get user's posts
		const posts = await pool.query(
			`
            SELECT 
                c.*,
                a.name as title,
                a.description,
                a.uri as audio_url,
                a.cover_pic_url,
                COUNT(cm.commentid) as comment_count
            FROM content c
            LEFT JOIN audio a ON c.audioid = a.audioid
            LEFT JOIN comments cm ON c.contentid = cm.contentid
            WHERE c.userid = $1
            GROUP BY c.contentid, a.audioid
            ORDER BY c.timestamp DESC
        `,
			[userid]
		);

		res.json({
			status: 200,
			profile: profileData.rows[0],
			posts: posts.rows,
		});
	} catch (error) {
		console.error("Profile Error:", error);
		res.status(500).json({ message: error.message });
	}
});
// Get user's followers
router.get("/followers/:userid", async (req, res) => {
	try {
		const { userid } = req.params;
		const followers = await pool.query(
			`
            SELECT 
                u.userid,
                u.username,
                u.profile_picture_url,
                u.is_verified,
                EXISTS(SELECT 1 FROM follows WHERE follower_id = $2 AND followed_id = u.userid) as is_following
            FROM follows f
            JOIN users u ON f.follower_id = u.userid
            WHERE f.followed_id = $1
            ORDER BY f.created_at DESC
        `,
			[userid, req.user?.id || null]
		);

		res.json({
			status: 200,
			followers: followers.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user's following
router.get("/following/:userid", async (req, res) => {
	try {
		const { userid } = req.params;
		const following = await pool.query(
			`
            SELECT 
                u.userid,
                u.username,
                u.profile_picture_url,
                u.is_verified,
                true as is_following
            FROM follows f
            JOIN users u ON f.followed_id = u.userid
            WHERE f.follower_id = $1
            ORDER BY f.created_at DESC
        `,
			[userid]
		);

		res.json({
			status: 200,
			following: following.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Modify the follow/unfollow endpoint to include notifications
router.post("/follow/:userID", JWTverification, async (req, res) => {
	try {
		const followerID = req.user.id;
		const followedID = req.params.userID;

		if (followerID === followedID) {
			return res.status(400).json({ message: "Cannot follow yourself" });
		}

		await pool.query("BEGIN");

		const existingFollow = await pool.query(
			"SELECT 1 FROM follows WHERE follower_id = $1 AND followed_id = $2",
			[followerID, followedID]
		);

		if (existingFollow.rows.length > 0) {
			await pool.query(
				"DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2",
				[followerID, followedID]
			);
			await pool.query("COMMIT");
			res.json({ status: 200, message: "Unfollowed successfully" });
		} else {
			await pool.query(
				"INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)",
				[followerID, followedID]
			);

			// Get follower's username for notification
			const followerData = await pool.query(
				"SELECT username FROM users WHERE userid = $1",
				[followerID]
			);

			// Create notification
			await pool.query(
				`INSERT INTO notifications (user_id, type, content, related_id)
                 VALUES ($1, 'follow', $2, $3)`,
				[
					followedID,
					`${followerData.rows[0].username} started following you`,
					followerID,
				]
			);

			await pool.query("COMMIT");
			res.json({ status: 200, message: "Followed successfully" });
		}
	} catch (error) {
		await pool.query("ROLLBACK");
		res.status(500).json({ message: error.message });
	}
});
module.exports = router;
