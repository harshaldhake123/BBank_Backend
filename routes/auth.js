const express = require("express");
const authController = require("../controllers/auth.controller");
const jwt = require("jsonwebtoken");
const router = express.Router();

router.post("/signup", authController.signUp);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/forgotpassword", authController.forgotPassword);


router.get("/checkReauth", function checkAuth(req, res, next) {
	try {
		let token = req.headers["authorization"];
		token = token.split(" ")[1];

		const decodedToken = jwt.verify(token, process.env.JWT_KEY);
		req.body.data = decodedToken;
		res.status(200).send({ login: true, decodedToken });
	} catch (e) {
		console.log(e.message);
		res.status(200).send({ login: false });
		// return res.status(401).json({
		// 	message: "Invalid or expired token provided!",
		// 	error: e,
		// });
	}
});

module.exports = router;
