const { pool } = require("../config/dbConfig");

const checkContentAccess = async (req, res, next) => {
    try {
        const { contentID } = req.params;
        const userID = req.user?.id;

        const content = await pool.query(
            `SELECT c.visibility, c.userID, 
             EXISTS(SELECT 1 FROM subscriptions s 
                    WHERE s.subscriber_id = $1 
                    AND s.artist_id = c.userID 
                    AND s.status = 'active') as is_subscribed
             FROM content c 
             WHERE c.contentID = $2`,
            [userID, contentID]
        );

        if (!content.rows.length) {
            return res.status(404).json({ message: "Content not found" });
        }

        const { visibility, userid: authorID, is_subscribed } = content.rows[0];

        if (visibility === 'private' && userID !== authorID) {
            return res.status(403).json({ message: "This content is private" });
        }

        if (visibility === 'premium' && !is_subscribed && userID !== authorID) {
            return res.status(403).json({ message: "Subscribe to access this content" });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = checkContentAccess;