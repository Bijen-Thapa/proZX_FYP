const express = require("express");
const router = express.Router();
const { pool } = require("../config/dbConfig");
const { JWTverification } = require("../middlewares/verifyJWT");

// Follow/Unfollow user
router.post("/follow/:targetUserId", JWTverification, async (req, res) => {
	try {
		const followerId = req.user.id;
		const { targetUserId } = req.params;

		// Check if already following
		const existingFollow = await pool.query(
			"SELECT * FROM follows WHERE follower_id = $1 AND followed_id = $2",
			[followerId, targetUserId]
		);

		if (existingFollow.rows.length > 0) {
			// Unfollow
			await pool.query(
				"DELETE FROM follows WHERE follower_id = $1 AND followed_id = $2",
				[followerId, targetUserId]
			);
			res.json({
				status: 200,
				message: "User unfollowed successfully",
			});
		} else {
			// Follow
			await pool.query(
				"INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)",
				[followerId, targetUserId]
			);
			res.json({
				status: 200,
				message: "User followed successfully",
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get followers list
router.get("/followers/:userId", async (req, res) => {
	try {
		const { userId } = req.params;
		const followers = await pool.query(
			`
            SELECT u.userID, u.username, u.profile_pic
            FROM follows f
            JOIN users u ON f.follower_id = u.userID
            WHERE f.followed_id = $1
            ORDER BY f.created_at DESC`,
			[userId]
		);

		res.json({
			status: 200,
			followers: followers.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get following list
router.get("/following/:userId", async (req, res) => {
	try {
		const { userId } = req.params;
		const following = await pool.query(
			`
            SELECT u.userID, u.username, u.profile_pic
            FROM follows f
            JOIN users u ON f.followed_id = u.userID
            WHERE f.follower_id = $1
            ORDER BY f.created_at DESC`,
			[userId]
		);

		res.json({
			status: 200,
			following: following.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Track user activity
router.post("/track", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { activityType, contentId } = req.body;

		await pool.query(
			"INSERT INTO user_activity (userID, activity_type, contentID) VALUES ($1, $2, $3)",
			[userId, activityType, contentId]
		);

		res.json({
			status: 200,
			message: "Activity tracked successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user activity history
router.get("/activity/:userId", JWTverification, async (req, res) => {
	try {
		const { userId } = req.params;
		const activities = await pool.query(
			`
            SELECT 
                ua.*,
                c.caption as content_caption,
                a.name as audio_name
            FROM user_activity ua
            LEFT JOIN content c ON ua.contentID = c.contentID
            LEFT JOIN audio a ON c.audioID = a.audioID
            WHERE ua.userID = $1
            ORDER BY ua.timestamp DESC`,
			[userId]
		);

		res.json({
			status: 200,
			activities: activities.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user recommendations
router.get("/recommendations", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		// Get recommendations based on user's activity and follows
		const recommendations = await pool.query(
			`
            SELECT DISTINCT 
                c.*,
                a.name as audio_name,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count
            FROM content c
            JOIN users u ON c.userID = u.userID
            LEFT JOIN audio a ON c.audioID = a.audioID
            LEFT JOIN likes l ON c.contentID = l.contentID
            WHERE c.userID IN (
                SELECT followed_id 
                FROM follows 
                WHERE follower_id = $1
            )
            GROUP BY c.contentID, a.name, u.username
            ORDER BY likes_count DESC
            LIMIT 10`,
			[userId]
		);

		res.json({
			status: 200,
			recommendations: recommendations.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Share content
router.post("/share", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { contentId, platform } = req.body;

		await pool.query(
			"INSERT INTO shares (userID, contentID, platform) VALUES ($1, $2, $3)",
			[userId, contentId, platform]
		);

		// Increment share count
		await pool.query(
			"UPDATE content SET share_count = share_count + 1 WHERE contentID = $1",
			[contentId]
		);

		res.json({
			status: 200,
			message: "Content shared successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

module.exports = router;
