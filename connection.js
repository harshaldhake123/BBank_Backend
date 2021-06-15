const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();

//localhost

// try {
// 	var conn = mysql.createConnection({
// 		host: process.env.DB_HOST,
// 		user: process.env.DB_USER,
// 		password: process.env.DB_PASSWORD,
// 		database: process.env.MYSQL_DB,
// 	});

// 	conn.connect((err) => {
// 		if (!err) {
// 			console.log("Database is connected successfully !");
// 		} else {
// 			console.log("Connection Failed !" + err.message);
// 		}
// 	});
// } catch (e) {
// 	console.dir(e);
// }


//heroku

try {
	var conn = mysql.createConnection({
		host: "us-cdbr-east-04.cleardb.com",
		user: "b37f9a855061b6",
		password: "b83e3b8e",
		database: "heroku_71fd201f7b7d076",
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



//heroku --
// var db_config = {
	// host: "us-cdbr-east-04.cleardb.com",
	// user: "b37f9a855061b6",
	// password: "b83e3b8e",
	// database: "heroku_71fd201f7b7d076",
// };
// var conn;

// function handleDisconnect() {
// 	conn = mysql.createConnection(db_config); // Recreate the connection, since
// 	// the old one cannot be reused.

// 	conn.connect(function (err) {
// 		// The server is either down
// 		if (err) {
// 			// or restarting (takes a while sometimes).
// 			console.log("error when connecting to db:", err);
// 			setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
// 		} else {
// 			console.log("Database is connected successfully !");
// 		} // to avoid a hot loop, and to allow our node script to
// 	}); // process asynchronous requests in the meantime.
// 	// If you're also serving http, display a 503 error.
// 	conn.on("error", function (err) {
// 		console.log("db error", err);
// 		conn.destroy();
// 		if (err.code === "PROTOCOL_CONNECTION_LOST") {
// 			// Connection to the MySQL server is usually
// 			handleDisconnect(); // lost due to either server restart, or a
// 		} else {
// 			// connnection idle timeout (the wait_timeout
// 			throw err; // server variable configures this)
// 		}
// 	});
// }

// handleDisconnect();

module.exports = conn;
