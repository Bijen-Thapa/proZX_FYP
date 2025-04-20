const jwt = require("jsonwebtoken");
const { pool } = require("../config/dbConfig");
require("dotenv").config();

const generateTokens = async (userId) => {
	const accessToken = jwt.sign(
		{ userId },
		process.env.JWT_SECRET,
		{ expiresIn: "1d" } // TODO: change expiration to 1h
	);

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	// Store refresh token in database (replace if exists)
	await pool.query(
		`
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES ($1, $2, NOW() + INTERVAL '7 days')
        ON CONFLICT (user_id)
        DO UPDATE SET 
            token = EXCLUDED.token,
            expires_at = EXCLUDED.expires_at,
            blacklisted = FALSE
    `,
		[userId, refreshToken]
	);

	return { accessToken, refreshToken };
};

const JWTverification = (req, res, next) => {
	const accessToken = req.headers.authorization?.replace("Bearer ", "");

	if (!accessToken) {
		return res.status(401).json({ message: "Access token required" });
	}

	try {
		const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		if (error.name === "TokenExpiredError") {
			return res.status(401).json({
				message: "Token expired",
				code: "TOKEN_EXPIRED",
			});
		}
		return res.status(401).json({ message: "Invalid token" });
	}
};

module.exports = {
	JWTverification,
	generateTokens,
};
