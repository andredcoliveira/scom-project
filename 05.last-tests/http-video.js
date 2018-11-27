var WebTorrent = require("webtorrent")
var http = require("http")
var fs = require("fs")
var url = require("url")
var path = require("path")
var express = require('express')
var app = express()

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

app.get('/video', function(req, res) {
  const path = '/output.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})

app.listen(7777, function () {
  console.log('Listening on port 7777!')
})


/* Use Torrent to display in HTTP */

// // Normal torrent handling as before.
// var magnet = "magnet:?xt=urn:btih:0ad50a6da2fd121075ebefefee34f7a4d0171eee&dn=out000&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com";
// var client = new WebTorrent();
// client.add(magnet, function (torrent) {
//     var file = torrent.files[number];

//     // You can still do this for MP4 video's.
//     // file.appendTo('#player',function(err, elem){
//     //    console.log(err)
//     // });

//     // .. But for other formats we're using this.
//     var server = http.createServer(function(req, res) {
//       // We only handle stream requests.
//       if (req.url != "/stream.mkv" && req.url != "/stream.avi" && req.url != "/stream.mp4") {
//         return res.writeHead(404, {"Content-Type": "text/plain"});
//         res.end();
//       }

//       // The absolute path to the local video file.
//       var localFile = torrent.path + "/" + file.path;

//       fs.stat(localFile, function (err, stats) {

//         // Check errors
//         if (err) {
//           if (err.code == "ENOENT") {
//             return res.writeHead(404, {"Content-Type": "text/plain"});
//           } else {
//             // For some reason we can't stat the file.
//             return res.writeHead(500, {"Content-Type": "text/plain"});
//           }
//           res.end(err);
//         }

//         // Check range
//         var range = req.headers.range;
//         if (!range) {
//           // Invalid range requested by client. The HTML5 video player
//           // should do this by itself.
//           return res.writeHead(416, {"Content-Type": "text/plain"});
//         }

//         // Calculate position to stream.
//         var positions = range.replace(/bytes=/, "").split("-");
//         var start = parseInt(positions[0], 10);
//         var total = stats.size;
//         var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
//         var chunksize = (end - start) + 1;

//         // Write headers for the stream.
//         res.writeHead(206, {
//           "Content-Range": "bytes " + start + "-" + end + "/" + total,
//           "Accept-Ranges": "bytes",
//           "Content-Length": chunksize,
//           "Content-Type": "video/mp4"
//         });
        
//         // Start the stream.
//         var stream = fs.createReadStream(localFile, { start: start, end: end })
//         .on("open", function() {
//           stream.pipe(res);
//         }).on("error", function(err) {
//           res.end(err);
//         });
//       })
//     }).listen(7777);

//     // Here goes the magic. Append this in your client.
//     $("body").append('<video controls autoplay src="http://localhost:7777/stream.mp4"></video>');
// });