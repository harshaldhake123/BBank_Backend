require("express-async-errors");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysqlConnection = require("./connection");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const bloodBankRoutes = require("./routes/bloodBank");
const adminRoutes = require("./routes/admin");

const cors = require("cors");
dotenv.config();

//heroku
// app.use(
// 	cors({
// 		origin: "https://bbankapp.netlify.app",
// 	})
// );

//localhost
app.use(
	cors({
		origin: "*",
	})
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use((err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	res.status(err.statusCode).json({
		status: err.status,
		message: err.message,
	});
});
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/bloodbank", bloodBankRoutes);
app.use("/admin", adminRoutes);


let port = process.env.PORT || 5000;

app.listen(port, function () {
	console.log("server started");
});
