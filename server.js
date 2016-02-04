var express = require("express");

var app = express();

app.use(express.static("public"));

app.get("/", function(req, res) {
	res.sendFile(__dirname + "/" + "index.htm");
});

app.get("/signin", function(req, res) {
	res.sendFile(__dirname + "/" + "signin.htm");
});

app.get("/signup", function(req, res) {
	res.sendFile(__dirname + "/" + "signup.htm");
});

app.get("/viewport", function(req, res) {
	res.sendFile(__dirname + "/" + "viewport.htm");
});

app.get("/secure", function(req, res) {
	res.sendFile(__dirname + "/" + "secure.htm");
});

var server = app.listen(8084, function() {
	var host = server.address().address;
	var port = server.address().port;
});