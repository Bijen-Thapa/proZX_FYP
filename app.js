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
app.use(cookieParser());

dotenv.config();

app.set("view engine", "ejs");

app.use(express.static("views"));

app.use(cors()); // cors enables ports to communicate with each other

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(morgan("dev")); // HTTP request logging
// app.use(express.json()); // Parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

app.use("/auth", authRoutes); // Authentication routes
// app.use("/products", productRoutes); // Product routes
// app.use("/order", orderRoutes); // order routes
// app.use("/admin", adminActionRoute); // admin routes
// app.use("/orders", authenticateJWT, orderRoutes); // Order routes (protected)

app.use("/uploads", express.static("./uploads"));
// app.use(express.static("./uploads"));

// app.use(errorHandler);
const { cookieSet } = require("./middlewares/cookiesSet");
app.use(cookieSet);

app.get("/", async (req, res) => {
	res.render("esewa");
});

app.get("/login", (req, res) => {
	res.render("login");
});

app.get("/signup", (req, res) => {
	res.render("registration");
});
app.get("/test", (req, res) => {
	res.json("testing123");
});

module.exports = app;
