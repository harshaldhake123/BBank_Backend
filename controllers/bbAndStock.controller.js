const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysqlConnection = require("../connection");
const bodyParser = require("body-parser");
const joi = require("@hapi/joi"); // For Validation
const e = require("express");

function allBankDetails(req, res) {
	var selectQuery =
		"SELECT bankId,name,address,pincode,city ,state,country,emailId,mobile,pincode from bloodbankdata where valid is true";
	mysqlConnection.query(selectQuery, (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });

		if (Array.isArray(rows)) {
			if (rows.length <= 0) {
				return res.status(204).send({ message: "Blood Banks not available" });
			} else {
				return res.status(200).send(rows);
			}
		}
	});
}

function getCounts(req, res) {
	var usersQuery = "(select COUNT(*) from userdata ) as users ,";
	var bbanksQuery = "(select COUNT(*) from bloodbankdata ) as bbanks ,";
	var campsQuery = "(select COUNT(*) from campdata) as camps , ";
	var stocksQuery =
		"(select sum (Apos + Aneg + Bpos + Bneg + ABpos + ABneg + Opos + Oneg ) from stockdata) as stocks , ";
	var plasmaQuery = "(select COUNT(*) from plasmadonordata) as plasmadonors";

	var selectQuery = "select" + usersQuery + bbanksQuery + campsQuery + stocksQuery + plasmaQuery;

	mysqlConnection.query(selectQuery, (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });

		if (Array.isArray(rows)) {
			if (rows.length <= 0) {
				res.status(204).send({ message: "Data not available" });
			} else {
				console.log(rows);
				res.status(200).send(rows[0]);
			}
		}
	});
}

function getPlasmaDonors(req, res) {
	var selectQuery = "SELECT * from plasmadonordata order by dateOfRecovery desc";
	mysqlConnection.query(selectQuery, (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });
		res.status(200).send(rows);
	});
}

module.exports = {
	allBankDetails: allBankDetails,
	getCounts: getCounts,
	getPlasmaDonors: getPlasmaDonors,
};
