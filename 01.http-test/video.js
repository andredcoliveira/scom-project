var http = require('http');
var fs = require("fs");

console.log("Server starting at localhost 3000");

http.createServer(function (request, response){
	response.writeHead(200, {'Content-Type': 'video/mp4'});
	var rs = fs.createReadStream("mp4_files/video.mp4");
	rs.pipe(response);
}).listen(3000);