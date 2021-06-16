const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysqlConnection = require("../connection");
const bodyParser = require("body-parser");
const joi = require("@hapi/joi"); // For Validation
var sha512 = require('js-sha512').sha512;
const nodemailer = require('nodemailer');
var tempTOTP;

const schema = joi.object({
	category: joi.string().min(3).max(10).required(),
	userName: joi.string().min(2).max(40),
	bloodBankName: joi.string().min(2).max(40),
	emailId: joi.string().min(6).max(40).required().email(),
	password: joi.string().min(6).required(),
	mobile: joi
		.string()
		.regex(/^[0-9]{10}$/)
		.messages({ "string.pattern.base": "Phone number must have 10 digits." }),
	dateofbirth: joi.date().raw(),
	gender: joi.string(),
	bloodGr: joi.string(),
	pincode: joi.string().max(6),
	address: joi.string().max(20),
	city: joi.string().max(20),
	state: joi.string().max(20),
	country: joi.string().max(20),
	otp: joi.string().min(6).max(6)
});

async function signUp(req, res) {
	//Validate the data
	const { error } = schema.validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

	//salting
	const salt = await bcrypt.genSaltSync(10);
	const hashedPassword = await bcrypt.hashSync(req.body.password, salt);

	switch (req.body.category) {
		case "user":
			userRegistration(req, res, hashedPassword);
			break;
		case "bbank":
			bankRegistration(req, res, hashedPassword);
			break;
	}
	console.log("Done");
}

function userRegistration(req, res, hashedPassword) {
	var userDetail = [];
	userDetail.push(req.body.userName);
	userDetail.push(req.body.emailId);
	userDetail.push(hashedPassword);
	userDetail.push(req.body.mobile);
	userDetail.push(req.body.dateofbirth);
	userDetail.push(req.body.gender);
	userDetail.push(req.body.bloodGr);
	userDetail.push(req.body.pincode);
	userDetail.push(req.body.address);
	userDetail.push(req.body.city);
	userDetail.push(req.body.state);
	userDetail.push(req.body.country);

	var checkExistsQuery = "SELECT * from userdata where emailId = ?";
	mysqlConnection.query(checkExistsQuery, [req.body.emailId], (err, rows, fields) => {
		let emailExist = false;
		if (Array.isArray(rows)) {
			if (rows.length > 0) {
				emailExist = true;
			}
		}

		if (!emailExist) {
			var insertQuery =
				"INSERT INTO userdata (name, emailId, password ,mobile, dob, gender, bloodGr , pincode, address, city, state ,country) values (?)";
			mysqlConnection.query(insertQuery, [userDetail], (err, rows, fields) => {
				if (!err) {
					const token = jwt.sign(
						{
							email: req.body.emailId,
							id: rows.insertId,
							user: "user",
						},
						process.env.JWT_KEY,
						function (err, token) {
							res.status(200).send({
								message: "Signup succesful!",
								token: token,
							});
						}
					);
					// return res.status(200).send({ message: "signup succesfully" });
				} else return res.status(400).send({ message: err });
			});
		} else {
			return res.status(401).send({ message: "Email already exists!" });
		}
	});
}

function bankRegistration(req, res, hashedPassword) {
	var bankDetail = [];
	bankDetail.push(req.body.bloodBankName);
	bankDetail.push(req.body.emailId);
	bankDetail.push(hashedPassword);
	bankDetail.push(req.body.mobile);
	bankDetail.push(req.body.pincode);
	bankDetail.push(req.body.address);
	bankDetail.push(req.body.city);
	bankDetail.push(req.body.state);
	bankDetail.push(req.body.country);

	var checkExistsQuery = "SELECT * from bloodbankdata where emailId = ?";
	mysqlConnection.query(checkExistsQuery, [req.body.emailId], (err, rows, fields) => {
		let emailExist = false;
		if (Array.isArray(rows)) {
			if (rows.length > 0) {
				emailExist = true;
			}
		}

		if (!emailExist) {
			var sql =
				"INSERT INTO bloodbankdata (name, emailId, password ,mobile, pincode, address, city, state ,country) values (?)";
			mysqlConnection.query(sql, [bankDetail], (err, rows, fields) => {
				if (!err) {
					const token = jwt.sign(
						{
							email: req.body.emailId,
							id: rows.insertId,
							user: "bbank",
						},
						process.env.JWT_KEY,
						function (err, token) {
							res.status(200).send({
								message: "Signup succesful!",
								token: token,
							});
						}
					);
					console.log("data stored");
				} else return res.status(400).send({ message: err });
			});

			setStock(req, res);
			console.log("Registration Successful");
		} else {
			console.log("Email already exists!");
			return res.status(401).redirect("/?error=" + encodeURIComponent("Email already exists!"));
		}
	});
}

function setStock(req, res) {
	console.log("in setstock!");
	let email = req.body.emailId;

	var getIdQuery = "SELECT bankId from bloodbankdata where emailId = ?";
	mysqlConnection.query(getIdQuery, [email], (err, rows, fields) => {
		let bankId = rows[0].bankId;
		let stockdata = [];
		stockdata.push(bankId);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push(0);
		stockdata.push("null");

		var insertQuery = "INSERT INTO stockdata () values (?)";
		mysqlConnection.query(insertQuery, [stockdata], (err, rows, fields) => {
			if (!err) {
				return console.log("Inserted succesfully");
			} else return console.log("Unable to insert data");
		});
	});
}


function login(req, res) {
	//Validate the data
	console.log("here in login");
	const { error } = schema.validate(req.body);
	console.log(error);

	if (error) return res.status(400).send({ message: error.details[0].message });

	var checkExistsQuery;
	console.log(req.body.category + "   " + req.body.emailId + "   " + req.body.password);

	switch (req.body.category) {
		case "user":
			checkExistsQuery = "SELECT emailId,password,userId from userdata where emailId = ?";
			break;
		case "bbank":
			checkExistsQuery = "SELECT emailId,password,bankId,valid from bloodbankdata where emailId = ?";
			break;
		case "admin":
			// code block
			adminLogin(req, res);
			return;
	}


	mysqlConnection.query(checkExistsQuery, [req.body.emailId], (err, rows, fields) => {
		let loginCredentials = {};
		let emailExist = false;
		if (Array.isArray(rows)) {
			if (rows.length > 0) {
				emailExist = true;
			}
		}

		if (!emailExist) {
			res.status(401).send({
				message: "Invalid credentials!",
			});
		} else {
			loginCredentials = rows[0];

			if (rows[0].valid === 0 && req.body.category === "bbank") {
				res.status(400).send({
					message: "BloodBank is not verified yet"
				});
			}
			else {
				var idFromDB;
				for (var colName in loginCredentials) {
					if (colName == "bankId" || colName == "userId") {
						idFromDB = loginCredentials[colName];
						break;
					}
				}

				bcrypt.compare(req.body.password, loginCredentials.password, function (err, result) {
					if (result) {
						const token = jwt.sign(
							{
								email: loginCredentials.emailId,
								id: idFromDB,
								user: req.body.category,
							},
							process.env.JWT_KEY,
							function (err, token) {
								res.status(200).send({
									message: "Authentication successful!",
									token: token,
								});
							}
						);
						console.log("done login");
					} else {
						res.status(401).json({
							message: "Invalid credentials!",
						});
					}
				});
			}
		}
	});
}

function adminLogin(req, res) {
	givenPassword = sha512(req.body.password);
	selectQuery = "SELECT * from admindata where emailId = ?";

	mysqlConnection.query(selectQuery, [req.body.emailId], (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });
		if (Array.isArray(rows)) {
			if (rows.length <= 0) {
				res.status(404).send({ message: "Invalid Credentials" });
			} else {
				if (rows[0].password === givenPassword) {
					const token = jwt.sign(
						{
							email: req.body.emailId,
							id: rows[0].adminId,
							user: req.body.category,
						},
						process.env.JWT_KEY,
						function (err, token) {
							res.status(200).send({
								message: "Authentication successful!",
								token: token,
							});
						}
					);
				} else {
					res.status(404).send({ message: "Invalid Credentials" });
				}
			}
		}
	});
}

// LOGOUT
function logout(req, res) {
	res.clearCookie("nToken");
	console.log("done loout");
	return res.redirect("/");
}


function generateotp(req, res) {
	tempTOTP = "" + Math.floor(Math.random() * 1000000);
	// console.log(tempTOTP);
	let mailTransporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'codersam2020@gmail.com',
			pass: 'CODERsam@2020'
		}
	});

	let mailDetails = {
		from: 'Admin BBank App <codersam2020@gmail.com>',
		to: req.params.email,
		subject: 'OTP to change password',
		text: 'Hi, here is your private OTP to change password : ' + tempTOTP + ''
	};

	mailTransporter.sendMail(mailDetails, function (err, data) {
		if (err) {
			console.log('Error Occurs');
			console.log(err)
			return res.status(400).send({ message: "Couldn't send OTP, try again later" })
		} else {
			// console.log(data);
			console.log('Email sent successfully');
			return res.status(200).send({ message: "OTP Sent" })
		}
	});
}

async function forgotPassword(req, res) {
	//Validate the data
	const { error } = schema.validate(req.body);
	if (error) return res.status(400).send({ message: error.details[0].message });

	if (req.body.otp !== tempTOTP) {
		return res.status(400).send({ message: "Please provid correct OTP" });
	}

	//salting
	const salt = await bcrypt.genSaltSync(10);
	const hashedPassword = await bcrypt.hashSync(req.body.password, salt);

	var updateQuery;

	switch (req.body.category) {
		case "user":
			updateQuery = "update userdata set password = ? where emailId = ?";
			break;
		case "bbank":
			updateQuery = "update bloodbankdata set password = ? where emailId = ?";
			break;
	}

	mysqlConnection.query(
		updateQuery, [hashedPassword, req.body.emailId], (err, rows, fields) => {
			if (err) return res.status(400).send({ message: err });
		}
	);
	return res.status(200).send({ message: "Password Changed" });
}




module.exports = {
	signUp: signUp,
	login: login,
	logout: logout,
	forgotPassword: forgotPassword,
	generateotp: generateotp,
};
