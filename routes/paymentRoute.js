const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { pool } = require("../config/dbConfig");
const { JWTverification } = require("../middlewares/verifyJWT");
const { body, validationResult } = require("express-validator");

const {
	initializeKhaltiPayment,
	verifyKhaltiPayment,
} = require("../config/khalti");

// Create subscription plans
router.post("/create-plan", JWTverification, async (req, res) => {
	try {
		const { name, amount, interval, description } = req.body;

		const product = await stripe.products.create({
			name: name,
			description: description,
		});

		const price = await stripe.prices.create({
			product: product.id,
			unit_amount: amount * 100, // Convert to cents
			currency: "usd",
			recurring: { interval: interval },
		});

		await pool.query(
			"INSERT INTO subscription_plans (stripe_price_id, name, amount, interval, description) VALUES ($1, $2, $3, $4, $5)",
			[price.id, name, amount, interval, description]
		);

		res.json({
			status: 200,
			message: "Subscription plan created successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get available subscription plans
router.get("/plans", async (req, res) => {
	try {
		const plans = await pool.query("SELECT * FROM subscription_plans");
		res.json({
			status: 200,
			plans: plans.rows,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Create payment session
router.post("/create-session", JWTverification, async (req, res) => {
	try {
		const { priceId } = req.body;
		const userId = req.user.id;

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: "subscription",
			success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
			customer_email: req.user.email,
			metadata: {
				userId: userId,
			},
		});

		res.json({
			status: 200,
			sessionId: session.id,
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Handle successful payment
router.post(
	"/webhook",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		const sig = req.headers["stripe-signature"];
		let event;

		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				process.env.STRIPE_WEBHOOK_SECRET
			);
		} catch (err) {
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		if (event.type === "checkout.session.completed") {
			const session = event.data.object;
			const userId = session.metadata.userId;

			// Update user subscription status
			await pool.query(
				"UPDATE users SET subscription_status = $1, subscription_id = $2 WHERE userID = $3",
				["active", session.subscription, userId]
			);

			// Record payment
			await pool.query(
				"INSERT INTO payments (userID, amount, stripe_payment_id, status) VALUES ($1, $2, $3, $4)",
				[
					userId,
					session.amount_total / 100,
					session.payment_intent,
					"completed",
				]
			);
		}

		res.json({ received: true });
	}
);

// Cancel subscription
router.post("/cancel-subscription", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await pool.query(
			"SELECT subscription_id FROM users WHERE userID = $1",
			[userId]
		);

		if (!user.rows[0].subscription_id) {
			return res.status(400).json({ message: "No active subscription found" });
		}

		await stripe.subscriptions.del(user.rows[0].subscription_id);

		await pool.query(
			"UPDATE users SET subscription_status = $1, subscription_id = NULL WHERE userID = $2",
			["cancelled", userId]
		);

		res.json({
			status: 200,
			message: "Subscription cancelled successfully",
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// Get subscription status
router.get("/subscription-status", JWTverification, async (req, res) => {
	try {
		const userId = req.user.id;
		const result = await pool.query(
			"SELECT subscription_status, subscription_id FROM users WHERE userID = $1",
			[userId]
		);

		res.json({
			status: 200,
			subscription: result.rows[0],
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

// route to initilize khalti payment gateway
router.post("/initialize-khalti", async (req, res) => {
	try {
		//try catch for error handling
		const { itemId, totalPrice, website_url } = req.body;
		console.log(itemId);

		// const itemData = await Item.findOne({
		// 	_id: itemId,
		// 	price: Number(totalPrice),
		// });

		// if (!itemData) {
		// 	return res.status(400).send({
		// 		success: false,
		// 		message: "item not found",
		// 	});
		// }

		// const purchasedItemData = await PurchasedItem.create({
		// 	item: itemId,
		// 	paymentMethod: "khalti",
		// 	totalPrice: totalPrice * 100,
		// });

		const paymentInitate = await initializeKhaltiPayment({
			amount: totalPrice * 100, // amount should be in paisa (Rs * 100)
			purchase_order_id: "purchasedItemData._id",
			purchase_order_name: "itemData.name",
			return_url: `${process.env.BACKEND_URI}/api/payment/complete-khalti-payment`,
			website_url,
		});

		console.log("payI", paymentInitate);

		res.json({
			success: true,
			// purchasedItemData,
			payment: paymentInitate,
		});
	} catch (error) {
		res.json({
			success: false,
			error,
		});
	}
});

// it is our `return url` where we verify the payment done by user
router.get("/complete-khalti-payment", async (req, res) => {
	const {
		pidx,
		txnId,
		amount,
		mobile,
		purchase_order_id,
		purchase_order_name,
		transaction_id,
	} = req.query;

	try {
		const paymentInfo = await verifyKhaltiPayment(pidx);

		// Check if payment is completed and details match
		if (
			paymentInfo?.status !== "Completed" ||
			paymentInfo.transaction_id !== transaction_id ||
			Number(paymentInfo.total_amount) !== Number(amount)
		) {
			return res.status(400).json({
				success: false,
				message: "Incomplete information",
				paymentInfo,
			});
		}

		// Check if payment done in valid item
		// const purchasedItemData = await PurchasedItem.find({
		// 	_id: purchase_order_id,
		// 	totalPrice: amount,
		// });

		// if (!purchasedItemData) {
		// 	return res.status(400).send({
		// 		success: false,
		// 		message: "Purchased data not found",
		// 	});
		// }
		// await PurchasedItem.findByIdAndUpdate(
		// 	purchase_order_id,

		// 	{
		// 		$set: {
		// 			status: "completed",
		// 		},
		// 	}
		// );

		// Create a new payment record
		// const paymentData = await Payment.create({
		// 	pidx,
		// 	transactionId: transaction_id,
		// 	productId: purchase_order_id,
		// 	amount,
		// 	dataFromVerificationReq: paymentInfo,
		// 	apiQueryFromUser: req.query,
		// 	paymentGateway: "khalti",
		// 	status: "success",
		// });

		// Send success response
		res.json({
			success: true,
			message: "Payment Successful",
			// paymentData,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			success: false,
			message: "An error occurred",
			error,
		});
	}
});

module.exports = router;
