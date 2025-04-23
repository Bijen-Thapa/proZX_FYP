const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoute");
// const adminActionRoute = require("./routes/adminActionRoute");
// const orderRoutes = require("./routes/orderRoutes");
// const errorHandler = require("./middleware/errorMiddleware");
// const { authenticateJWT } = require("./middleware/authMiddleware");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const userRoute = require("./routes/userRoute");

app.use(cookieParser());

dotenv.config();

app.set("view engine", "ejs");

app.use(express.static("views"));

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Access-Token",
			"Access-Control-Allow-Credentials",
			"Access-Control-Allow-Origin",
			"Origin",
			"Accept",
		],
		exposedHeaders: ["Content-Range", "X-Content-Range"],
		preflightContinue: true,
		optionsSuccessStatus: 204,
	})
); // cors enables ports to communicate with each other

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan("dev")); // HTTP request logging
// app.use(express.json()); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// app.use("/products", productRoutes); // Product routes
// app.use("/order", orderRoutes); // order routes
// app.use("/admin", adminActionRoute); // admin routes
// app.use("/orders", authenticateJWT, orderRoutes); // Order routes (protected)

app.use("/uploads", express.static("./uploads"));
// app.use(express.static("./uploads"));

// app.use(errorHandler);
const { cookieSet } = require("./middlewares/cookiesSet");
// const { sendMail } = require("./middlewares/sendMail");
app.use(cookieSet);

// const { send } = require("./middlewares/nodeMailer");
const { sendMail } = require("./middlewares/sendMail");

// const admin = require("./routes")
const adminRoute = require("./routes/adminRoute");
const paymentRoute = require("./routes/paymentRoute");
const postRout = require("./routes/postRoute");
const userProfile = require("./routes/profileRoute");
const { message } = require("statuses");
const status = require("statuses");

// Make audio files publicly accessible
app.use('/audio', express.static('./audio'));

// Add this before your routes
app.options("*", cors()); // Enable preflight for all routes

app.use("/auth", authRoutes); // Authentication routes
app.use("/api/admin", adminRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/post", postRout);
app.use("/api/user", userRoute); // Add this line
app.use("/api/profile", userProfile);

app.get("/", async (req, res) => {
	// res.send(send());
	// res.render("forgot");
	res.json({
		status: 200,
		message: "Hello world from the Backend!",
	});
});

// app.get("/login", (req, res) => {
// 	res.render("login");
// });

// app.get("/signup", (req, res) => {
// 	res.render("registration");
// });

// app.get("/forgot", (req, res) => {
// 	res.render("forgot");
// });
// app.get("/test", (req, res) => {
// 	res.json("testing123");
// });

module.exports = app;
