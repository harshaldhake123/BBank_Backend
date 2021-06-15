const jwt = require("jsonwebtoken");

module.exports = function checkAuth(req, res, next) {
	try {
		let token = req.headers["authorization"];
		token = token.split(" ")[1];

		if(!token){
			return res.status(401).json({
				message: "Invalid or expired token provided!",
				error: e,
			});
		}

		const decodedToken = jwt.verify(token, process.env.JWT_KEY);
		req.body.data = decodedToken;
		next();
	} catch (e) {
		console.log(e.message);
		return res.status(401).json({
			message: "Invalid or expired token provided!",
			error: e,
		});
	}
};
