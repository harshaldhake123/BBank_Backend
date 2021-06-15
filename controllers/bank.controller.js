const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysqlConnection = require("../connection");
const bodyParser = require("body-parser");
const joi = require("@hapi/joi"); // For Validation
const e = require("express");

function profile(req, res) {
	var email = req.body.data.email;
	var selectQuery = "SELECT bankId , name, emailId, mobile, pincode from bloodbankdata where emailId = ?";
	mysqlConnection.query(selectQuery, [email], (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });
		res.status(200).send(rows[0]);
	});
}

async function updateProfile(req, res) {
	var email = req.body.data.email;
	var password = req.body.password;

	if (password) {
		const salt = await bcrypt.genSaltSync(10);
		const hashedPassword = await bcrypt.hashSync(password, salt);

		var updateQuery = "update bloodbankdata set name=?, mobile=?, pincode=?, password=? where emailId = ?";
		mysqlConnection.query(
			updateQuery,
			[req.body.name, req.body.mobile, req.body.pincode,hashedPassword,email],
			(err, rows, fields) => {
				if (err) return res.status(400).send({ message: err });
			}
		);
	}
	else{
		var updateQuery = "update bloodbankdata set name=?, mobile=?, pincode=? where emailId = ?";
		mysqlConnection.query(
			updateQuery,
			[req.body.name, req.body.mobile, req.body.pincode, email],
			(err, rows, fields) => {
				if (err) res.status(400).send({ message: err });
			}
		);
	}

	var selectQuery = "SELECT bankId , name, emailId, mobile, pincode from bloodbankdata where emailId = ?";
	mysqlConnection.query(selectQuery, [email], (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });
		res.status(200).send(rows[0]);
	});
}

function updateStock(req, res) {
	var bankId = req.body.data.id;
	console.log("id of update stock: " + bankId);
	let ts = Date.now();
	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();

	var stockDetail = [];
	stockDetail.push(bankId);
	stockDetail.push(req.body["Apos"] || 0);
	stockDetail.push(req.body["Aneg"] || 0);
	stockDetail.push(req.body["Bpos"] || 0);
	stockDetail.push(req.body["Bneg"] || 0);
	stockDetail.push(req.body["ABpos"] || 0);
	stockDetail.push(req.body["ABneg"] || 0);
	stockDetail.push(req.body["Opos"] || 0);
	stockDetail.push(req.body["Oneg"] || 0);
	stockDetail.push(date + "-" + month + "-" + year + "  " + hours + ":" + minutes);

	var checkExistsQuery = "SELECT * from stockdata where bankId = ?";
	mysqlConnection.query(checkExistsQuery, [bankId], (err, rows, fields) => {
		let stockExist = false;
		if (Array.isArray(rows)) {
			if (rows.length > 0) {
				stockExist = true;
			}
		}

		if (!stockExist) {
			var insertQuery = "INSERT INTO stockdata() values (?)";
			mysqlConnection.query(insertQuery, [stockDetail], (err, rows, fields) => {
				!err
					? res.status(200).send({ message: "Inserted succesfully" })
					: res.status(400).send({ message: err });
			});

			console.log("Blood Stock stored successfully!");
		} else {
			var updateQuery =
				"UPDATE stockdata set Apos=? , Aneg=? , Bpos=? ,Bneg=? ,ABpos=? ,ABneg=? ,Opos=? ,Oneg=? ,LastUpdated=? where bankId = ?";
			mysqlConnection.query(
				updateQuery,
				[
					stockDetail[1],
					stockDetail[2],
					stockDetail[3],
					stockDetail[4],
					stockDetail[5],
					stockDetail[6],
					stockDetail[7],
					stockDetail[8],
					stockDetail[9],
					bankId,
				],
				(err, result, fields) => {
					if (err) return res.status(400).send({ message: err });
					res.status(200).send({ message: "Updated succesfully" });
				}
			);
			console.log("Blood Stock updated successfully!");
		}
	});
}

function getStockOfBank(req, res) {
	var id = req.params.id;
	console.log(id);
	console.log(req.params.id);
	var selectQuery = `SELECT * from stockdata where bankId=${id}`;
	mysqlConnection.query(selectQuery, (err, rows, fields) => {
		if (err) return res.status(400).send({ message: err });
		console.log("rows: " + rows);
		res.status(200).send(rows[0]);
	});
}

function bloodRequestFromUser(req, res) {
	var id = req.body.data.id;
	var selectQuery = "SELECT * from requestdata where bankId = ?";
	mysqlConnection.query(selectQuery, [id], (err, rows, fields) => {
		if (err) return res.status(400).send({ message: err });

		if (Array.isArray(rows)) {
			if (rows.length <= 0) {
				res.status(204).send({ message: "Request not available" });
			} else {
				res.status(200).send(rows[0]);
			}
		}
	});
}

function validateBloodRequest(req, res) {
	var bankId = req.body.data.id;
	var userId = req.body.userId;
	var bloodGr = req.body.bloodGr;
	var amount = req.body.amount;

	let ts = Date.now();
	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();
	var LastUpdated = date + "-" + month + "-" + year + "  " + hours + ":" + minutes;

	var getStockQuery = "SELECT * from stockdata where bankId = ?";
	mysqlConnection.query(getStockQuery, [bankId], (err, rows, fields) => {
		let stockExist = false;
		if (Array.isArray(rows)) {
			if (rows.length > 0) {
				stockExist = true;
			}
		}

		if (stockExist) {
			rows[0][bloodGr] = rows[0][bloodGr] - amount;
			rows[0].LastUpdated = LastUpdated;

			var stockDetail = [];
			stockDetail.push(bankId);
			stockDetail.push(rows[0]["Apos"]);
			stockDetail.push(rows[0]["Aneg"]);
			stockDetail.push(rows[0]["Bpos"]);
			stockDetail.push(rows[0]["Bneg"]);
			stockDetail.push(rows[0]["ABpos"]);
			stockDetail.push(rows[0]["ABneg"]);
			stockDetail.push(rows[0]["Opos"]);
			stockDetail.push(rows[0]["Oneg"]);
			stockDetail.push(rows[0]["LastUpdated"]);

			var status = "Confirmed";
			var updateQuery = "UPDATE requestdata set status=? where bankId = ? and userId = ?";
			mysqlConnection.query(updateQuery, [status, bankId, userId], (err, result, fields) => {
				if (err) res.status(400).send({ message: err });
			});

			var updateQuery =
				"UPDATE stockdata set Apos=? , Aneg=? , Bpos=? ,Bneg=? ,ABpos=? ,ABneg=? ,Opos=? ,Oneg=? ,LastUpdated=? where bankId = ?";
			mysqlConnection.query(
				updateQuery,
				[
					stockDetail[1],
					stockDetail[2],
					stockDetail[3],
					stockDetail[4],
					stockDetail[5],
					stockDetail[6],
					stockDetail[7],
					stockDetail[8],
					stockDetail[9],
					bankId,
				],
				(err, result, fields) => {
					if (err) res.status(400).send({ message: err });
				}
			);

			res.status(200).send({ message: "Request Verified" });
		} else {
			console.log("Stock doesn't exists!");
			return res.status(400).send({ message: "Stock is not available!" });
		}
	});
}

module.exports = {
	profile: profile,
	updateProfile: updateProfile,
	updateStock: updateStock,
	getStockOfBank: getStockOfBank,
	bloodRequestFromUser: bloodRequestFromUser,
	validateBloodRequest: validateBloodRequest,
};
