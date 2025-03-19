var jwt = require("jsonwebtoken");
require("dotenv").config();

const JWTverification = (req, res, next) => {
	let token = req.headers.authorization?.replace("Bearer ", "");
	let isloggedIn = false;

	try {
		var decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		//   console.log(req.user);

		isloggedIn = true;
	} catch {}

	if (isloggedIn) {
		next();
	} else {
		res.status(401).send({
			msg: "Unauthorized",
		});
	}
};



module.exports = {
	JWTverification,
};
