var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
app.use(express.static(__dirname + '/public'));
// increase payload limit
app.use(express.json({ limit: '50mb' }));

var viewing = "none";

app.get("/view", (req, res) => {
	console.log("view " + req.query.id);
	if (req.query.id != undefined) {
		viewing = req.query.id;
	}
	res.sendFile(__dirname + "/public/pages/view/index.html");
});

/**
 * get the id of the server that the user is currently viewing
 */
app.get("/viewing", (req, res) => {
	console.log(viewing);
	res.send(viewing);
});

/**
 * POST request
 * Receives a group of frames from Roblox
 */
app.post("/frames", (req, res) => {
	// console.log(req.body);
	io.emit("render", req.body);
	res.send("received");
});

io.on("connection", (socket) => {
	console.log("connection");
	socket.on("disconnect", () => {
		console.log("disconnection");
		viewing = "none";
	});
});

http.listen(8080, () => {
	console.log("Server is running on port 8080");
});