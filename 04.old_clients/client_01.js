var http = require('http');
var fs = require('fs');
var WebTorrent = require('webtorrent');

var magnet = "magnet:?xt=urn:btih:0ad50a6da2fd121075ebefefee34f7a4d0171eee&dn=out000&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com";
var dht_opts = {
	bootstrap: ['172.16.2.55:6771']
};
var torrent_opts = {
	announce: [],        		  // Torrent trackers to use (added to list in .torrent or magnet uri)
	// getAnnounceOpts: Function, // Custom callback to allow sending extra parameters to the tracker
	// maxWebConns: Number,       // Max number of simultaneous connections per web seed [default=4]
	path: __dirname + "/stream/",       // Folder to download files to (default=`/tmp/webtorrent/`)
	// store: Function            // Custom chunk store (must follow [abstract-chunk-store](https://www.npmjs.com/package/abstract-chunk-store) API)
};
var client = new WebTorrent(dht_opts);

console.log(__dirname + "/stream/");

client.add(magnet, torrent_opts, function (torrent) {
	// Got torrent metadata!
	console.log('Torrent info hash:', torrent.infoHash)
	// var file = torrent.files[number];
});

client.on('error', function(error){
	console.log(error);
});

client.on('torrent', function(torrent){
	console.log('mangetURI' + torrent.magnetURI);
	torrent.addPeer('172.16.2.55:6771');
});

while(true) {
	if (client.torrents[0] != null) {
		console.log("ENTROU");
		client.torrents[0].addPeer('172.16.2.55:6771');
		break;
	}
	console.log(client.torrents[0].numPeers);
}
console.log(client.torrents[0].numPeers);


// http.createServer(function (req, res) {
//     fs.createReadStream(files).pipe(res);
// }).listen(1337, '127.0.0.1');
// console.log('Server running at http://127.0.0.1:1337/');