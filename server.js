const ipLookup = require("./ipLookup.js");
const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.urlencoded());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/domain", (req, res) => {
  console.log(req.body);
  const domain = req.body.domain;
  console.log(domain)
  let data = ipLookup.runLookup(domain)
  data.then(ipInfo => {
    console.log("done");
    console.log(ipInfo)
    io.emit("ipInfo", ipInfo)
  })
  
  res.sendStatus(200);
});

const listener = server.listen(8000, function () {
  console.log("You're on 8k");
});

io.on("connection", (socket) => {
  console.log("We're connected");
});
