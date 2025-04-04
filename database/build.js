const fs = require("fs");
const { pool } = require("../config/dbConfig");
const sqlQuery = fs.readFileSync("./utils/database.sql", "utf-8");

pool.query(sqlQuery, (err) => {
	if (err) {
		console.log(err);
		return;
	}
	console.log("Database built successfully");
});

pool.end();
