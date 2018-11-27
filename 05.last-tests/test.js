const express = require('express')
const fs = require('fs')
const path = require('path')
// var http = require('http')
const app = express()

app.use(express.static(__dirname))

// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname + '/index.html'))
// })

app.listen('9700');
console.log('working on 9700');

// console.log("Server starting at localhost 3000");

// http.createServer(function (request, response){
// 	response.writeHead(200, {'Content-Type': 'video/mp4'});
// 	var rs = fs.createReadStream("mp4_files/video.mp4");
// 	rs.pipe(response);
// }).listen(3000);