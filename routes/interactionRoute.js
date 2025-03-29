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

// Block/Unblock user
router.post("/block/:targetUserId", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { targetUserId } = req.params;

		const existingBlock = await pool.query(
			"SELECT * FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2",
			[userId, targetUserId]
		);

		if (existingBlock.rows.length > 0) {
			await pool.query(
				"DELETE FROM user_blocks WHERE blocker_id = $1 AND blocked_id = $2",
				[userId, targetUserId]
			);
			res.json({
				status: 200,
				message: "User unblocked successfully",
			});
		} else {
			await pool.query(
				"INSERT INTO user_blocks (blocker_id, blocked_id) VALUES ($1, $2)",
				[userId, targetUserId]
			);
			res.json({
				status: 200,
				message: "User blocked successfully",
			});
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Report content
router.post("/report/content/:contentId", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { contentId } = req.params;
		const { reason, description } = req.body;

		await pool.query(
			"INSERT INTO content_reports (userID, contentID, reason, description, status) VALUES ($1, $2, $3, $4, $5)",
			[userId, contentId, reason, description, "pending"]
		);

		res.json({
			status: 200,
			message: "Content reported successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get personalized recommendations based on user's genre preferences
router.get("/recommendations/genre", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const recommendations = await pool.query(
			`
            SELECT DISTINCT 
                c.*,
                a.name as audio_name,
                a.genre,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count
            FROM content c
            JOIN audio a ON c.audioID = a.audioID
            JOIN users u ON c.userID = u.userID
            LEFT JOIN likes l ON c.contentID = l.contentID
            WHERE a.genre IN (
                SELECT DISTINCT genre 
                FROM audio 
                WHERE audioID IN (
                    SELECT audioID 
                    FROM user_activity 
                    WHERE userID = $1 
                    AND activity_type = 'listen'
                )
            )
            AND c.userID != $1
            GROUP BY c.contentID, a.name, a.genre, u.username
            ORDER BY likes_count DESC
            LIMIT 15`,
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

// Get trending content
router.get("/trending", async (req, res) => {
	try {
		const trending = await pool.query(`
            SELECT 
                c.*,
                a.name as audio_name,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count,
                COUNT(DISTINCT cm.commentID) as comments_count,
                COUNT(DISTINCT s.shareID) as shares_count
            FROM content c
            JOIN users u ON c.userID = u.userID
            LEFT JOIN audio a ON c.audioID = a.audioID
            LEFT JOIN likes l ON c.contentID = l.contentID
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            LEFT JOIN shares s ON c.contentID = s.contentID
            WHERE c.timestamp >= NOW() - INTERVAL '7 days'
            GROUP BY c.contentID, a.name, u.username
            ORDER BY (
                COUNT(DISTINCT l.userID) + 
                COUNT(DISTINCT cm.commentID) * 2 + 
                COUNT(DISTINCT s.shareID) * 3
            ) DESC
            LIMIT 20`);

		res.json({
			status: 200,
			trending: trending.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user engagement metrics
router.get("/engagement/:userId", JWTverification, async (req, res) => {
	try {
		const { userId } = req.params;

		const metrics = await pool.query(
			`
            SELECT 
                COUNT(DISTINCT c.contentID) as total_posts,
                SUM(c.share_count) as total_shares,
                COUNT(DISTINCT l.likeID) as total_likes_received,
                COUNT(DISTINCT pl.playlistID) as total_playlists,
                (
                    SELECT COUNT(*)
                    FROM likes
                    WHERE userID = $1
                ) as total_likes_given
            FROM content c
            LEFT JOIN likes l ON c.contentID = l.contentID
            LEFT JOIN playlists pl ON c.userID = pl.userID
            WHERE c.userID = $1
            GROUP BY c.userID`,
			[userId]
		);

		res.json({
			status: 200,
			metrics: metrics.rows[0],
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Add content to favorites
router.post("/favorites/add/:contentId", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { contentId } = req.params;

		await pool.query(
			"INSERT INTO favorites (userID, contentID) VALUES ($1, $2)",
			[userId, contentId]
		);

		res.json({
			status: 200,
			message: "Added to favorites successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user's favorite content
router.get("/favorites", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const favorites = await pool.query(
			`
            SELECT 
                c.*,
                a.name as audio_name,
                u.username,
                f.created_at as favorited_at
            FROM favorites f
            JOIN content c ON f.contentID = c.contentID
            JOIN users u ON c.userID = u.userID
            LEFT JOIN audio a ON c.audioID = a.audioID
            WHERE f.userID = $1
            ORDER BY f.created_at DESC`,
			[userId]
		);

		res.json({
			status: 200,
			favorites: favorites.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get content moderation queue
router.get("/moderation/queue", JWTverification, async (req, res) => {
	try {
		const reports = await pool.query(`
            SELECT 
                cr.*,
                c.caption,
                u.username as reporter_username,
                uc.username as content_owner
            FROM content_reports cr
            JOIN content c ON cr.contentID = c.contentID
            JOIN users u ON cr.userID = u.userID
            JOIN users uc ON c.userID = uc.userID
            WHERE cr.status = 'pending'
            ORDER BY cr.created_at ASC`);

		res.json({
			status: 200,
			reports: reports.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update report status
router.put(
	"/moderation/update/:reportId",
	JWTverification,
	async (req, res) => {
		try {
			const { reportId } = req.params;
			const { status, actionTaken } = req.body;

			await pool.query(
				"UPDATE content_reports SET status = $1, action_taken = $2, resolved_at = NOW() WHERE reportID = $3",
				[status, actionTaken, reportId]
			);

			res.json({
				status: 200,
				message: "Report status updated successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Create notification
router.post("/notifications/create", JWTverification, async (req, res) => {
	try {
		const { recipientId, type, contentId, message } = req.body;
		const senderId = req.user.id;

		await pool.query(
			"INSERT INTO notifications (sender_id, recipient_id, type, content_id, message, read_status) VALUES ($1, $2, $3, $4, $5, $6)",
			[senderId, recipientId, type, contentId, message, false]
		);

		res.json({
			status: 200,
			message: "Notification created successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user's notifications
router.get("/notifications", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const notifications = await pool.query(
			`
            SELECT 
                n.*,
                us.username as sender_username,
                us.profile_pic as sender_profile_pic,
                c.caption as content_caption,
                a.name as audio_name
            FROM notifications n
            LEFT JOIN users us ON n.sender_id = us.userID
            LEFT JOIN content c ON n.content_id = c.contentID
            LEFT JOIN audio a ON c.audioID = a.audioID
            WHERE n.recipient_id = $1
            ORDER BY n.created_at DESC
            LIMIT 50`,
			[userId]
		);

		res.json({
			status: 200,
			notifications: notifications.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Mark notifications as read
router.put("/notifications/read", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { notificationIds } = req.body;

		await pool.query(
			"UPDATE notifications SET read_status = true WHERE notificationID = ANY($1) AND recipient_id = $2",
			[notificationIds, userId]
		);

		res.json({
			status: 200,
			message: "Notifications marked as read",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get unread notification count
router.get("/notifications/unread/count", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const result = await pool.query(
			"SELECT COUNT(*) as unread_count FROM notifications WHERE recipient_id = $1 AND read_status = false",
			[userId]
		);

		res.json({
			status: 200,
			unreadCount: result.rows[0].unread_count,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Delete notification
router.delete(
	"/notifications/:notificationId",
	JWTverification,
	async (req, res) => {
		try {
			const userId = req.user.id;
			const { notificationId } = req.params;

			await pool.query(
				"DELETE FROM notifications WHERE notificationID = $1 AND recipient_id = $2",
				[notificationId, userId]
			);

			res.json({
				status: 200,
				message: "Notification deleted successfully",
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Clear all notifications
router.delete("/notifications/clear/all", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		await pool.query("DELETE FROM notifications WHERE recipient_id = $1", [
			userId,
		]);

		res.json({
			status: 200,
			message: "All notifications cleared successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get notification preferences
router.get("/notifications/preferences", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const preferences = await pool.query(
			"SELECT * FROM notification_preferences WHERE userID = $1",
			[userId]
		);

		res.json({
			status: 200,
			preferences: preferences.rows[0] || {},
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Update notification preferences
router.put("/notifications/preferences", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const {
			likes_enabled,
			comments_enabled,
			follows_enabled,
			shares_enabled,
			mentions_enabled,
			email_notifications,
		} = req.body;

		await pool.query(
			`
            INSERT INTO notification_preferences 
                (userID, likes_enabled, comments_enabled, follows_enabled, shares_enabled, mentions_enabled, email_notifications)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (userID) 
            DO UPDATE SET 
                likes_enabled = $2,
                comments_enabled = $3,
                follows_enabled = $4,
                shares_enabled = $5,
                mentions_enabled = $6,
                email_notifications = $7`,
			[
				userId,
				likes_enabled,
				comments_enabled,
				follows_enabled,
				shares_enabled,
				mentions_enabled,
				email_notifications,
			]
		);

		res.json({
			status: 200,
			message: "Notification preferences updated successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get notifications by type
router.get("/notifications/type/:type", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { type } = req.params;

		const notifications = await pool.query(
			`
            SELECT 
                n.*,
                us.username as sender_username,
                us.profile_pic as sender_profile_pic,
                c.caption as content_caption,
                a.name as audio_name
            FROM notifications n
            LEFT JOIN users us ON n.sender_id = us.userID
            LEFT JOIN content c ON n.content_id = c.contentID
            LEFT JOIN audio a ON c.audioID = a.audioID
            WHERE n.recipient_id = $1 AND n.type = $2
            ORDER BY n.created_at DESC
            LIMIT 20`,
			[userId, type]
		);

		res.json({
			status: 200,
			notifications: notifications.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get notification statistics
router.get("/notifications/stats", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const stats = await pool.query(
			`
            SELECT 
                type,
                COUNT(*) as total_count,
                COUNT(CASE WHEN read_status = false THEN 1 END) as unread_count
            FROM notifications
            WHERE recipient_id = $1
            GROUP BY type`,
			[userId]
		);

		res.json({
			status: 200,
			statistics: stats.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user interaction insights
router.get("/insights/:userId", JWTverification, async (req, res) => {
	try {
		const { userId } = req.params;
		const { timeframe } = req.query; // daily, weekly, monthly

		const insights = await pool.query(
			`
            SELECT 
                DATE_TRUNC($1, ua.timestamp) as period,
                ua.activity_type,
                COUNT(*) as activity_count,
                COUNT(DISTINCT ua.contentID) as unique_content_count
            FROM user_activity ua
            WHERE ua.userID = $2
            GROUP BY period, ua.activity_type
            ORDER BY period DESC`,
			[timeframe || "week", userId]
		);

		res.json({
			status: 200,
			insights: insights.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user content performance
router.get(
	"/content/performance/:contentId",
	JWTverification,
	async (req, res) => {
		try {
			const { contentId } = req.params;

			const performance = await pool.query(
				`
            SELECT 
                c.contentID,
                c.timestamp as posted_at,
                COUNT(DISTINCT l.userID) as likes_count,
                COUNT(DISTINCT cm.commentID) as comments_count,
                COUNT(DISTINCT s.shareID) as shares_count,
                COUNT(DISTINCT f.userID) as favorites_count,
                (
                    SELECT COUNT(DISTINCT ua.userID)
                    FROM user_activity ua
                    WHERE ua.contentID = c.contentID
                    AND ua.activity_type = 'view'
                ) as view_count
            FROM content c
            LEFT JOIN likes l ON c.contentID = l.contentID
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            LEFT JOIN shares s ON c.contentID = s.contentID
            LEFT JOIN favorites f ON c.contentID = f.contentID
            WHERE c.contentID = $1
            GROUP BY c.contentID`,
				[contentId]
			);

			res.json({
				status: 200,
				performance: performance.rows[0],
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Get user interaction network
router.get("/network/:userId", JWTverification, async (req, res) => {
	try {
		const { userId } = req.params;

		const network = await pool.query(
			`
            SELECT 
                u.userID,
                u.username,
                u.profile_pic,
                COUNT(DISTINCT l.contentID) as likes_interaction,
                COUNT(DISTINCT cm.commentID) as comments_interaction,
                COUNT(DISTINCT s.shareID) as shares_interaction
            FROM users u
            LEFT JOIN likes l ON (l.userID = u.userID AND l.contentID IN (SELECT contentID FROM content WHERE userID = $1))
            LEFT JOIN comments cm ON (cm.userID = u.userID AND cm.contentID IN (SELECT contentID FROM content WHERE userID = $1))
            LEFT JOIN shares s ON (s.userID = u.userID AND s.contentID IN (SELECT contentID FROM content WHERE userID = $1))
            WHERE u.userID != $1
            GROUP BY u.userID
            HAVING (COUNT(DISTINCT l.contentID) + COUNT(DISTINCT cm.commentID) + COUNT(DISTINCT s.shareID)) > 0
            ORDER BY (COUNT(DISTINCT l.contentID) + COUNT(DISTINCT cm.commentID) + COUNT(DISTINCT s.shareID)) DESC
            LIMIT 20`,
			[userId]
		);

		res.json({
			status: 200,
			network: network.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user behavior patterns
router.get("/behavior/:userId", JWTverification, async (req, res) => {
	try {
		const { userId } = req.params;

		const patterns = await pool.query(
			`
            SELECT 
                EXTRACT(HOUR FROM ua.timestamp) as hour_of_day,
                ua.activity_type,
                COUNT(*) as activity_count,
                STRING_AGG(DISTINCT a.genre, ', ') as preferred_genres
            FROM user_activity ua
            LEFT JOIN content c ON ua.contentID = c.contentID
            LEFT JOIN audio a ON c.audioID = a.audioID
            WHERE ua.userID = $1
            AND ua.timestamp >= NOW() - INTERVAL '30 days'
            GROUP BY hour_of_day, ua.activity_type
            ORDER BY hour_of_day, activity_count DESC`,
			[userId]
		);

		res.json({
			status: 200,
			patterns: patterns.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get content discovery suggestions
router.get("/discover", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;

		const discoveries = await pool.query(
			`
            WITH user_interests AS (
                SELECT DISTINCT a.genre
                FROM user_activity ua
                JOIN content c ON ua.contentID = c.contentID
                JOIN audio a ON c.audioID = a.audioID
                WHERE ua.userID = $1
                AND ua.timestamp >= NOW() - INTERVAL '30 days'
            )
            SELECT 
                c.*,
                a.name as audio_name,
                a.genre,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count,
                COUNT(DISTINCT cm.commentID) as comments_count
            FROM content c
            JOIN audio a ON c.audioID = a.audioID
            JOIN users u ON c.userID = u.userID
            LEFT JOIN likes l ON c.contentID = l.contentID
            LEFT JOIN comments cm ON c.contentID = cm.contentID
            WHERE a.genre IN (SELECT genre FROM user_interests)
            AND c.userID != $1
            AND c.contentID NOT IN (
                SELECT contentID 
                FROM user_activity 
                WHERE userID = $1
            )
            GROUP BY c.contentID, a.name, a.genre, u.username
            ORDER BY c.timestamp DESC, likes_count DESC
            LIMIT 20`,
			[userId]
		);

		res.json({
			status: 200,
			discoveries: discoveries.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get collaborative filtering recommendations
router.get(
	"/recommendations/collaborative",
	JWTverification,
	async (req, res) => {
		try {
			const userId = req.user.id;

			const recommendations = await pool.query(
				`
            WITH similar_users AS (
                SELECT 
                    ua2.userID,
                    COUNT(*) as common_interactions
                FROM user_activity ua1
                JOIN user_activity ua2 ON ua1.contentID = ua2.contentID
                WHERE ua1.userID = $1
                AND ua2.userID != $1
                GROUP BY ua2.userID
                ORDER BY common_interactions DESC
                LIMIT 10
            )
            SELECT DISTINCT
                c.*,
                a.name as audio_name,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count
            FROM content c
            JOIN audio a ON c.audioID = a.audioID
            JOIN users u ON c.userID = u.userID
            LEFT JOIN likes l ON c.contentID = l.contentID
            WHERE c.userID IN (SELECT userID FROM similar_users)
            AND c.contentID NOT IN (
                SELECT contentID 
                FROM user_activity 
                WHERE userID = $1
            )
            GROUP BY c.contentID, a.name, u.username
            ORDER BY likes_count DESC
            LIMIT 15`,
				[userId]
			);

			res.json({
				status: 200,
				recommendations: recommendations.rows,
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Get user mood-based recommendations
router.get("/recommendations/mood", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const { mood } = req.query;

		const recommendations = await pool.query(
			`
            SELECT DISTINCT
                c.*,
                a.name as audio_name,
                a.mood as audio_mood,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count
            FROM content c
            JOIN audio a ON c.audioID = a.audioID
            JOIN users u ON c.userID = u.userID
            LEFT JOIN likes l ON c.contentID = l.contentID
            WHERE a.mood = $1
            AND c.userID != $2
            GROUP BY c.contentID, a.name, a.mood, u.username
            ORDER BY c.timestamp DESC, likes_count DESC
            LIMIT 15`,
			[mood, userId]
		);

		res.json({
			status: 200,
			recommendations: recommendations.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get user engagement timeline
router.get(
	"/engagement/timeline/:userId",
	JWTverification,
	async (req, res) => {
		try {
			const { userId } = req.params;
			const { startDate, endDate } = req.query;

			const timeline = await pool.query(
				`
            SELECT 
                DATE_TRUNC('day', ua.timestamp) as date,
                COUNT(*) as total_interactions,
                COUNT(DISTINCT ua.contentID) as unique_contents,
                STRING_AGG(DISTINCT ua.activity_type, ', ') as activities
            FROM user_activity ua
            WHERE ua.userID = $1
            AND ua.timestamp BETWEEN $2 AND $3
            GROUP BY DATE_TRUNC('day', ua.timestamp)
            ORDER BY date DESC`,
				[userId, startDate, endDate]
			);

			res.json({
				status: 200,
				timeline: timeline.rows,
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

// Get content similarity recommendations
router.get(
	"/recommendations/similar/:contentId",
	JWTverification,
	async (req, res) => {
		try {
			const { contentId } = req.params;

			const similar = await pool.query(
				`
            WITH content_info AS (
                SELECT 
                    c.contentID,
                    a.genre,
                    a.mood,
                    a.tempo
                FROM content c
                JOIN audio a ON c.audioID = a.audioID
                WHERE c.contentID = $1
            )
            SELECT DISTINCT
                c.*,
                a.name as audio_name,
                u.username,
                COUNT(DISTINCT l.userID) as likes_count
            FROM content c
            JOIN audio a ON c.audioID = a.audioID
            JOIN users u ON c.userID = u.userID
            JOIN content_info ci ON (
                a.genre = ci.genre OR 
                a.mood = ci.mood OR 
                ABS(a.tempo - ci.tempo) <= 20
            )
            LEFT JOIN likes l ON c.contentID = l.contentID
            WHERE c.contentID != $1
            GROUP BY c.contentID, a.name, u.username
            ORDER BY likes_count DESC
            LIMIT 10`,
				[contentId]
			);

			res.json({
				status: 200,
				similar: similar.rows,
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
);

module.exports = router;
