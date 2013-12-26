var express = require('express');
var app = express();

var PORT = 8000;

app.configure(function() {
	app.use(express.static(__dirname));
});

app.get("/", function(req, res) {
	res.send("index.html");
});

app.listen(PORT);

console.log("server running on localhot:"+PORT);