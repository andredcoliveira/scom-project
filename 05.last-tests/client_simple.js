var WebTorrent = require('webtorrent-hybrid')
var fs = require('fs')

/* Use DHT */
// var dht_opts = {
//     bootstrap: ['172.16.2.55:6881'],   // bootstrap servers (default: router.bittorrent.com:6881, router.utorrent.com:6881, dht.transmissionbt.com:6881)
//     // host: false                     // host of local peer, if specified then announces get added to local table (String, disabled by default)
// };
// var opts = {
//     tracker: false,
//     dht: dht_opts
// };
// var client = new WebTorrent(opts);
/*********+*/

var client = new WebTorrent();
var magnetURI = 'magnet:?xt=urn:btih:76da469da43f757e7974d39e236bf803919c9cad&dn=out000.mp4&tr=http%3A%2F%2F172.16.2.55%3A6881%2Fannounce&tr=udp%3A%2F%2F172.16.2.55%3A6881&tr=ws%3A%2F%2F172.16.2.55%3A6881';
// var infoHash = '83f947976cb8adba5634cbd6794d40393220e018';

var torrent_opts = {
    // announce: [],                       // Torrent trackers to use (added to list in .torrent or magnet uri)
    path: __dirname + '/downloaded'     // Folder to download files to (default=`/tmp/webtorrent/`)
}

// Cycle to get all files from the magnet links in txtFilename
client.add(magnetURI, torrent_opts, (torrent) => {
// client.add(infoHash, torrent_opts, (torrent) => {
    console.log('Client is downloading: ', torrent.infoHash);

    torrent.on('download', (bytes) => {
        console.log('\njust downloaded: ' + bytes + ' bytes');
        console.log('total downloaded: ' + (torrent.downloaded / (1024 * 1024)).toFixed(2) + ' MiB');
        console.log('download speed: ' + (torrent.downloadSpeed / 1024).toFixed(2) + ' KiB/s');
        console.log('progress: ' + torrent.progress.toFixed(3));
    });
});

