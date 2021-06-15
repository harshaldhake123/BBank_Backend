const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysqlConnection = require("../connection");
const bodyParser = require("body-parser");
const joi = require("@hapi/joi");    // For Validation
const e = require('express');


const schema = joi.object({
    name: joi.string().min(3).required(),
    email: joi.string().min(6).required().email(),
    mobile: joi.string().regex(/^[0-9]{10}$/).messages({'string.pattern.base': 'Phone number must have 10 digits.'}).required(),
    fromDate: joi.date().raw().required(),
    toDate: joi.date().raw().required(),
    address: joi.string().required(),
    pincode: joi.string().max(6).required(),
    city: joi.string().max(20).required(),
    state: joi.string().max(20).required(),
    country: joi.string().max(20).required(),
    data:joi.object()
});

function showCampByBank(req, res){
    var id = req.body.data.id
    var selectQuery = "SELECT * from campdata where bankId = ? order by fromDate desc";
    mysqlConnection.query(selectQuery,[id],(err, rows, fields) => {
        if (err) res.status(400).send({ message: err });
        res.status(200).send(rows)
    });
}

function showCampsToUser(req, res){
    var selectQuery = "SELECT * from campdata order by fromDate desc";
    mysqlConnection.query(selectQuery,(err, rows, fields) => {
        if (err) res.status(400).send({message:err})
        res.status(200).send(rows);
    });
}

function registerToCamp(req,res) {
    let campId = req.body.campId
    let userId = req.body.data.id
    data=[]
    data.push(campId)
    data.push(userId)

    var checkExistsQuery = "SELECT * from registerdata where campId = ? and userId = ?";
    mysqlConnection.query(checkExistsQuery,[data[0],data[1]],(err, rows, fields) => {
        let exist=false;
        if (Array.isArray(rows)){
            if(rows.length>0){
                exist=true
            }
        }
        if(!exist){
            var insertQuery = 'INSERT INTO registerdata(campId, userId) values (?)';
            mysqlConnection.query(insertQuery,
                    [data], (err, rows, fields) => {
                    !err
                        ? res.status(200).send({ message: "Registered successfully" })
                        : res.status(400).send({ message: err });
                }
            );
        }
        else{
            res.status(200).send({ message: "Already registered" })
        }
    });

}

function showRegistrationForCamp(req, res){
    let campId = req.body.campId
    var selectQuery = 'SELECT campdata.name,userdata.name, userdata.emailId, userdata.mobile FROM ((campdata INNER JOIN registerdata ON campdata.campID = registerdata.campID) INNER JOIN userdata ON userdata.userId=registerdata.userId and registerdata.campId= ?)';
    mysqlConnection.query(selectQuery,campId,(err, rows, fields) => {
        if (err) res.status(400).send({message:err})
        res.status(200).send(rows);
    });
}

function showRegisteredCamp(req, res){
    let userId = req.body.data.id

    var selectQuery = 'SELECT campdata.name,campdata.emailId,campdata.mobile,campdata.fromDate,campdata.toDate,campdata.address,campdata.pincode,campdata.city,campdata.country FROM campdata INNER JOIN registerdata ON campdata.campID = registerdata.campID and registerdata.userId= ?';
    mysqlConnection.query(selectQuery,userId,(err, rows, fields) => {
        if (err) res.status(400).send({message:err})
        res.status(200).send(rows);
    });
}


function organizeCamp(req, res){
    const {error} = schema.validate(req.body);
    if (error) return res.status(400).send({message:error.details[0].message});

    var bankId = req.body.data.id
    var campDetail=[];
    campDetail.push(bankId);
    campDetail.push(req.body.name);
    campDetail.push(req.body.email);
    campDetail.push(req.body.mobile);
    campDetail.push(req.body.fromDate);
    campDetail.push(req.body.toDate);
    campDetail.push(req.body.address);
    campDetail.push(req.body.pincode);
    campDetail.push(req.body.city);
    campDetail.push(req.body.state);
    campDetail.push(req.body.country);

    var checkExistsQuery = "SELECT * from campdata where name = ? and fromDate = ? and toDate = ?";
    mysqlConnection.query(checkExistsQuery,[req.body.name,req.body.fromDate,req.body.toDate],(err, rows, fields) => {
        let campExist=false;
        if (Array.isArray(rows)){
            if(rows.length>0){
                campExist=true
            }
        }

        if(!campExist){
            var insertQuery = 'INSERT INTO campdata(bankId, name, emailId, mobile, fromDate, toDate, address , pincode, city, state, country) values (?)';
            mysqlConnection.query(insertQuery,
                    [campDetail], (err, rows, fields) => {
                    !err
                        ? res.status(200).send({ message: "Registered successfully" })
						: res.status(400).send({ message: err });
                }
            );
            console.log("Camp created successfully!");
        }else{
            console.log("Camp already exists!");
            return res.status(400).send({message:'Camp already exists!'});
        }
    });
}


module.exports = {
    organizeCamp: organizeCamp,
    showCampByBank: showCampByBank,
    showCampsToUser: showCampsToUser,
    registerToCamp: registerToCamp,
    showRegistrationForCamp:showRegistrationForCamp,
    showRegisteredCamp: showRegisteredCamp
}