const joi = require("joi");

const validateRegistration = async (req, res, next) => {
	const schema = joi.object({
		userName: joi.string().required(),
		email: joi.string().email().required(),
		phone: joi.number().min(9000000000).max(9999999999).integer().required(),
		address: joi.string().alphanum().pattern(/'+-'/),
		password: joi.string().min(6).max(30).required(),
	});

	try {
		const { error } = schema.validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}
		next();
	} catch (err) {
		console.log(err.message);
        next();
	}
};
const validateLogin = async (req, res, next) => {
	const schema = joi.object({
		email: joi.string().email().required(),
		password: joi.string().min(6).max(30).required(),
	});

	try {
		const { error } = schema.validate(req.body);
		if (error) {
			return res.status(400).send(error.details[0].message);
		}
		next();
	} catch (err) {
		console.log(err.message);
        next();
	}
};

module.exports = { validateRegistration,validateLogin };
