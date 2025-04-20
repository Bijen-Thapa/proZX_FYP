const express = require("express");
const router = express.Router();
const { pool } = require("../config/dbConfig");
const { JWTverification } = require("../middlewares/verifyJWT");

// Check if user is an artist
router.get("/isArtist/:userId", JWTverification, async (req, res) => {
	try {
		const { userId } = req.params;
		const result = await pool.query("SELECT * FROM artist WHERE userid = $1", [
			userId,
		]);

		if (result.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ isArtist: result.rows[0] });
	} catch (error) {
		console.error("Error checking artist status:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Get user profile
router.get("/profile", JWTverification, async (req, res) => {
	try {
		const userId = req.user.userId;
		const result = await pool.query(
			"SELECT userid, username, email, phoneno, address, is_artist FROM users WHERE userid = $1",
			[userId]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ message: "User not found" });
		}

		res.json({ user: result.rows[0] });
	} catch (error) {
		console.error("Error fetching profile:", error);
		res.status(500).json({ message: "Server error" });
	}
});

// Update user profile
router.put("/profile", JWTverification, async (req, res) => {
	try {
		const userId = req.user.userId;
		const { username, phoneno, address } = req.body;

		const result = await pool.query(
			"UPDATE users SET username = $1, phoneno = $2, address = $3 WHERE userid = $4 RETURNING *",
			[username, phoneno, address, userId]
		);

		res.json({ user: result.rows[0] });
	} catch (error) {
		console.error("Error updating profile:", error);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
