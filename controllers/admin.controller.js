const mysqlConnection = require("../connection");
const e = require("express");

function invalidBankDetails(req, res) {
	console.log('in here');
	var selectQuery =
		"SELECT bankId,name,address,pincode,city,state,country,emailId,mobile,pincode from bloodbankdata where valid is False";
	mysqlConnection.query(selectQuery, (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });

		if (Array.isArray(rows)) {
			if (rows.length <= 0) {
				return res.status(204).send({ message: "No new blood banks available" });
			} else {
				return res.status(200).send(rows);
			}
		}
	});
}

function setValidBloodbank(req, res) {
	var id = req.params.id;
	var updateQuery = `UPDATE bloodbankdata set valid=True where bankId = ${id}`;
	mysqlConnection.query(updateQuery, (err, result, fields) => {
		if (err) res.status(400).send({ message: err });
		res.status(200).send({ message: "Blood bank verified" });
	});
}



module.exports = {
	invalidBankDetails: invalidBankDetails,
	setValidBloodbank: setValidBloodbank,
};