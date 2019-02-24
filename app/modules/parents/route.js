var express = require("express");
var router = express.Router();
var request = require("request");
var db = require('../../lib/database')();
var moment = require('moment');

router.get("/login", (req, res) => {
  res.render("parents/views/login");
});

router.get("/menu", (req, res) => {
	let qS = `SELECT * FROM tbl_parent JOIN tbl_child ON intParentID = intChildParentID;`
	db.query(qS, [req.session.intParentID], (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			res.render("parents/views/menu", {anaks: results});
		}
		else{
			res.redirect('/parents/home');
		}
	})
});
router.post('/acceptanak', (req, res) => {
	let quSt = `UPDATE tbl_child set strStatus = 'Accept' WHERE intChildID = ?`
	db.query(quSt, [req.body.childID], (err, results, field) => {
		if(err) console.log(err);

		console.log(req.body.childID)
		res.send('Yes');
		res.end();
	})
})

router.post('/declineanak', (req, res) => {
	let quSt = `UPDATE tbl_child set strStatus = 'Decline' WHERE intChildID = ?`
	db.query(quSt, [req.body.childID], (err, results, field) => {
		if(err) console.log(err);
		console.log(req.body.childID)

		res.send('Yes');
		res.end();
	})
})

router.post('/anakkahilingan', (req, res) => {
	console.log(req.body);

	let qS = `INSERT INTO tbl_gantimpala (strName, intGantimpalaChildID, intGantimpalaParantID) VALUES (?, ?, ?);`
	db.query(qS, [req.body.kahilinganInput, req.session.bata.intChildID, req.session.bata.intChildParentID], (err, results, field) => {
		if(err) console.log(err);
		res.send('Yes');
		res.end();
	})
})

router.post('/acceptgantimpala', (req, res) => {
	console.log(req.body);


	let qS = `INSERT INTO tbl_quest (intGantimpalaID, strName) VALUES (?, ?);`
	for(var i = 0; i < req.body.quests.length; i++){
		db.query(qS, [req.body.gantimpalaID, req.body.quests[i]], (err, results, field) => {
			if(err) console.log(err);
		})
		if(i == req.body.quests.length - 1){
			let qs2 = `UPDATE tbl_gantimpala SET strDate = ?, strStatus = "Accept" where intGantimpalaID = ?`;
			db.query(qs2, [new Date(req.body.dates+' '+req.body.times), req.body.gantimpalaID], (err, results, fields) => {
				if(err) console.log(err);
				res.send('Yes');
				res.end();
			})
		}
	}
})

router.get("/rewards/:intChildID", (req, res) => {
	let qS = `SELECT * FROM tbl_gantimpala WHERE intGantimpalaChildID = ? and intGantimpalaParantID = ?`
	db.query(qS, [req.params.intChildID, req.session.magulang.intParentID], (err, results, fields) => {
		if(err) console.log(err);
		if(results.length > 0){
			res.render("parents/views/rewards", {gantimpala: results});
		}
		else{
			res.redirect('/parents/menu');
		}
	})
});

router.get("/home", (req, res) => {
	console.log(req.session.magulang)
  res.render("parents/views/main", {magulang: req.session.magulang});
});

router.post("/authparent", (req, res) => {
	let queryString = 'SELECT * FROM tbl_parent WHERE strUsername = ? and strPassword = ?;'
	db.query(queryString, [req.body.userName, req.body.passWord], (err, results, field) => {
		if(err) console.log(err);
		req.session.magulang = results[0];
		if(results.length > 0){
			res.send('Yes');
			res.end()
		} 
		else{
			res.send('No');
			res.end();
		}
	})
});

router.post("/authbata2", (req, res) => {
	let queryString = 'SELECT * FROM tbl_child WHERE strUsername = ? and strPassword = ?;'
	db.query(queryString, [req.body.userName, req.body.passWord], (err, results, field) => {
		if(err) console.log(err);
		if(results.length > 0){
			req.session.bata = results[0];
			res.send('Yes');
			res.end()
		} 
		else{
			res.send('No');
			res.end();
		}
	})
});

router.post("/authbata", (req, res) => {
	var bata = req.body;
	let queryString = 'SELECT * FROM tbl_parent WHERE strCode = ?;'
	db.query(queryString, [req.body.code], (err, results, field) => {
		if(err) console.log(err);
		console.log(results)
		if(results.length == 0){
			res.send('No');
			res.end();
		}
		else{
			let parentID = results[0].intParentID;
			let queryString2 = `INSERT INTO tbl_child (strFirstName, strLastName, strEmail, strUsername, strpassword, intChildParentID) VALUES (?, ?, ?, ?, ? ,?)`
			db.query(queryString2, [req.body.firstName, req.body.lastName, req.body.emailAddress, req.body.userName, req.body.passWord, parentID], (err, results, field) => {
				if(err) console.log(err);
				req.session.bata = bata;
				res.send('Yes');
				res.end();
			})
		}
	})
});

router.get("/anakhome", (req, res) => {
	console.log(req.session.bata)
  res.render("parents/views/anakdash", {bata: req.session.bata});
});

router.get("/anakmenu", (req, res) => {

	let qS = `SELECT * FROM tbl_gantimpala WHERE intGantimpalaChildID = ?`
	db.query(qS, [req.session.bata.intChildID], (err, results, fields) => {
		if(err) console.log(err);
		console.log(results);
		if(results.length > 0){
			res.render("parents/views/anakmenu", {gantimpala: results});
		}
		else{
			res.render("parents/views/anakmenu", {gantimpala: results});
		}
	})
	
});

router.get("/anakquest", (req, res) => {
  res.render("parents/views/anakquest");
});

router.get("/questform", (req, res) => {
  res.render("parents/views/questForm");
});

router.get("/quests", (req, res) => {
  res.render("parents/views/quests");
});

router.post("/paymaya", (req, res) => {
	console.log(req.hostname, req.port);
		console.log(req.body)
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		
		for (var i = 0; i < 8; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		let queryString = `INSERT INTO tbl_parent (strFirstName, strLastName, strEmail, strUsername, strPassword, strCode) VALUES (?, ?, ?, ?, ?, ?)`;
		db.query(queryString, [req.body.firstName, req.body.lastName, req.body.emailAddress, req.body.userName, req.body.passWord, text], (err, results, field) => {
			if(err) console.log(err);

			req.session.magulang = req.body;
			req.session.magulang.code = text;

			var options = {
				url: "https://pg-sandbox.paymaya.com/checkout/v1/checkouts",
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization:
						"Basic cGstQThhRXNwdGpaR1hhcjlBdDNaUEtIMERsVVpnZTVVS1hGcWxvZUdEdEFSbQ="
				},
				body: `{
						"totalAmount": {
							"currency": "PHP",
							"value": "150.00",
							"details": {
							"subtotal": "150.00"
							}
						},
						"items": [
							{
							"name": "QUESTudyante Subscription Fee",
							"description": "One-time payment only.",
							"quantity": "1",
							"amount": {
								"value": "150.00"
							},
							"totalAmount": {
								"value": "150.00"
							}
							}
						],
						"redirectUrl": {
							"success": "http://${req.hostname}:${req.port}/parents/home?type=new",
							"failure": "http://www.askthemaya.com/failure?id=6319921",
							"cancel": "http://www.askthemaya.com/cancel?id=6319921"
						},
						"requestReferenceNumber": "APP-REF-8374384753475",
						"metadata": {}
						}`
			};
		
			function callback(error, response, body) {
				console.log(JSON.parse(body));
				req.session.checkoutId = JSON.parse(body).checkoutId;
				res.send({ url: JSON.parse(body).redirectUrl });
			}
		
			request(options, callback);
		})
	

});

exports.parents = router;
