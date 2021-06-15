const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mysqlConnection = require("../connection");
const bodyParser = require("body-parser");
const joi = require("@hapi/joi"); // For Validation
const e = require("express");


const schema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().min(6).required().email(),
    mobile: joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': 'Phone number must have 10 digits.'}).required(),
	bloodGr: joi.string().min(3).required(),
    dateOfRecovery: joi.date().raw().required(),
    address: joi.string().min(3).required(),
    data:joi.object()
});


function profile(req, res) {
	var email = req.body.data.email;

	var selectQuery =
		"SELECT userId , name, emailId, mobile,dob, gender, bloodGr, pincode from userdata where emailId = ?";
	mysqlConnection.query(selectQuery, [email], (err, rows, fields) => {
		if (err) return res.status(400).send({ message: err });
		return res.status(200).send(rows[0]);
	});
}

async function updateProfile(req, res) {
	var email = req.body.data.email;
	var password = req.body.password;

	if (password) {
		const salt = await bcrypt.genSaltSync(10);
		const hashedPassword = await bcrypt.hashSync(password, salt);

		var updateQuery = "update userdata set name=?, mobile=?,dob=?, gender=?, bloodGr=?, pincode=? , password=? where emailId = ?";
		mysqlConnection.query(
			updateQuery,
			[req.body.name, req.body.mobile, req.body.dob, req.body.gender, req.body.bloodGr, req.body.pincode,hashedPassword,email],
			(err, rows, fields) => {
				if (err) return res.status(400).send({ message: err });
			}
		);
	}
	else{
		var updateQuery = "update userdata set name=?, mobile=?,dob=?, gender=?, bloodGr=?, pincode=? where emailId = ?";
		mysqlConnection.query(
			updateQuery,
			[req.body.name, req.body.mobile, req.body.dob, req.body.gender, req.body.bloodGr, req.body.pincode, email],
			(err, rows, fields) => {
				if (err) return res.status(400).send({ message: err });
			}
		);
	}

	var selectQuery =
		"SELECT userId , name, emailId, mobile,dob, gender, bloodGr, pincode from userdata where emailId = ?";
	mysqlConnection.query(selectQuery, [email], (err, rows, fields) => {
		if (err) {
			return res.status(400).send({ message: err });
		}
		console.log("profile updated...............");
		return res.status(200).send(rows);
	});
}

function getStock(req, res) {
	var selectQuery =
		"SELECT bloodbankdata.name, bloodbankdata.emailId, bloodbankdata.mobile , bloodbankdata.pincode, stockdata.* FROM stockdata INNER JOIN bloodbankdata ON bloodbankdata.bankId=stockdata.bankId";
	mysqlConnection.query(selectQuery, (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });
		res.status(200).send(rows);
	});
}

function addRequest(req, res) {
	userId = req.body.data.id;

	let ts = Date.now();
	let date_ob = new Date(ts);
	let date = date_ob.getDate();
	let month = date_ob.getMonth() + 1;
	let year = date_ob.getFullYear();
	let hours = date_ob.getHours();
	let minutes = date_ob.getMinutes();

	var requestDetails = [];
	requestDetails.push(req.body.bankId); //bankId
	requestDetails.push(req.body.data.id); //userId
	requestDetails.push(req.body.bloodGr); //bloodGr
	requestDetails.push(req.body.amount); //amount
	requestDetails.push(date + "-" + month + "-" + year); // date
	requestDetails.push(hours + ":" + minutes); //time
	requestDetails.push("Pending"); //status

	var checkExistsQuery = "SELECT * from requestdata where userId = ?";
	mysqlConnection.query(checkExistsQuery, [userId], (err, rows, fields) => {
		let requestExist = false;

		if (Array.isArray(rows)) {
			if (rows.length > 0) {
				requestExist = true;
			}
		}

		if (requestExist) {
			console.log("Request already exists , You can only do one request per day!");
			return res.status(400).send({ message: "request already exists , You can only do one request per day!" });
		} else {
			var stockExistsQuery = "SELECT * from stockdata where bankId = ?";
			mysqlConnection.query(stockExistsQuery, [req.body.bankId], (err, rows, fields) => {
				let stockExist = false;
				if (Array.isArray(rows)) {
					if (rows.length > 0) {
						stockExist = true;
					}
				}

				if (stockExist) {
					let available = false;
					var stockAmount = rows[0][req.body.bloodGr];
					stockAmount > req.body.amount ? (available = true) : (available = false);

					if (available) {
						var insertQuery =
							"INSERT INTO requestdata(bankId,userId,bloodGr,amount,date,time,status) values (?)";
						mysqlConnection.query(insertQuery, [requestDetails], (err, rows, fields) => {
							!err
								? res.status(200).send({ message: "Request Sent succesfully" })
								: res.status(400).send({ message: err });
						});

						console.log("Request sent successfully!");
					} else {
						return res.status(400).send({ message: "Stock is not available!" });
					}
				} else {
					console.log("Stock doesn't exists!");
					return res.status(400).send({ message: "Stock is not available!" });
				}
			});
		}
	});
}

function showRequest(req, res) {
	var id = req.body.data.id;
	var selectQuery = "SELECT * from requestdata where userId = ?";
	mysqlConnection.query(selectQuery, [id], (err, rows, fields) => {
		if (err) res.status(400).send({ message: err });

		if (Array.isArray(rows)) {
			if (rows.length <= 0) {
				res.status(200).send({ message: "Requests not available!" });
			} else {
				res.status(200).send(rows);
			}
		}
	});
}

function plasmaDonorRegister(req, res){
	console.log("here in plasma")
	console.log(req.body);
	let obj = {
		name: req.body.name,
		email: req.body.emailId,
		mobile: req.body.mobile,
		bloodGr: req.body.bloodGr,
		dateOfRecovery: req.body.dateOfRecovery,
		address: req.body.address,
		data: joi.object(),
	};
    const { error } = schema.validate(obj);
    if (error) return res.status(400).send({message:error.details[0].message});

    var details=[];
    details.push(req.body.name);
    details.push(req.body.emailId);
    details.push(req.body.mobile);
    details.push(req.body.bloodGr);
    details.push(req.body.dateOfRecovery);
    details.push(req.body.address);

    var checkExistsQuery = "SELECT * from plasmadonordata where emailId = ? and mobile = ?";
    mysqlConnection.query(checkExistsQuery,[req.body.emailId,req.body.mobile],(err, rows, fields) => {
        let exist=false;
        if (Array.isArray(rows)){
            if(rows.length>0){
                exist=true
            }
        }

        if(!exist){
            var insertQuery = 'INSERT INTO plasmadonordata(name, emailId, mobile, bloodGr, dateOfRecovery, address) values (?)';
            mysqlConnection.query(insertQuery,
                    [details], (err, rows, fields) => {
                    !err
						? res.status(200).send({ message: "Registered successfully" })
						: res.status(400).send({ message: err });
                }
            );
            console.log("Registered successfully!");
        }else{
            console.log("already exists!");
            return res.status(400).send({message:'Mobile number or email already exists!'});
        }
    });
}


module.exports = {
	profile: profile,
	updateProfile: updateProfile,
	getStock: getStock,
	addRequest: addRequest,
	showRequest: showRequest,
	plasmaDonorRegister: plasmaDonorRegister
};
