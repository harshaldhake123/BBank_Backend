const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

//localhost

try {
	var conn = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.MYSQL_DB,
	});

	conn.connect((err) => {
		if (!err) {
			console.log("Database is connected successfully !");
		} else {
			console.log("Connection Failed !" + err.message);
		}
	});
} catch (e) {
	console.dir(e);
}


//heroku

// var conn;
// function handleConnection() {

// 	try {
// 		conn = mysql.createConnection({
// 			host: "us-cdbr-east-04.cleardb.com",
// 			user: "b37f9a855061b6",
// 			password: "b83e3b8e",
// 			database: "heroku_71fd201f7b7d076",
// 		});

// 		conn.connect((err) => {
// 			if (!err) {
// 				console.log("Database is connected successfully !");
// 			} else {
// 				console.log("Connection Failed !" + err.message);
// 			}
// 		});
// 	} catch (e) {
// 		console.dir(e);
// 	}
// }


// handleConnection();

module.exports = conn;