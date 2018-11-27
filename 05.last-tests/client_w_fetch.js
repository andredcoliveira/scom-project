/** Use DHT **/
// var dht_opts = {
//     bootstrap: ['172.16.2.55:6881'],   // bootstrap servers (default: router.bittorrent.com:6881, router.utorrent.com:6881, dht.transmissionbt.com:6881)
//     // host: false                     // host of local peer, if specified then announces get added to local table (String, disabled by default)
// };
// var opts = {
//     tracker: false,
//     dht: dht_opts
// };
// var client = new WebTorrent(opts);
/***********+*/

/** Fetch the magnets.txt to get the magnet links  **/

// var ip = '172.16.2.55';
var ip = '10.227.152.19';
var port = '8991';
var fileMagnets = 'magnets.txt';
var magnetsArray = [];

let num = 0;
let index = 0;
let client;

function getMagnets() {
    fetch(`http://${ip}:${port}/${fileMagnets}`).then(function(response) {
        return response.text();
    }).then(function(data) {
        var msg = data.toString('utf-8').split('\n');
        msg.forEach(x => {
            num = parseInt(x.slice(x.indexOf("dn=out") + 6, x.indexOf(".mp4")));
            if (num !== null && num === num && num >= 0) {
                magnetsArray[num] = x;
            }
        })
        if (magnetsArray.length > 0) {
            client = new WebTorrent();
            // var magnetURI = 'magnet:?xt=urn:btih:4f41d8c1a220c0ccf21535c35957b679232adf76&dn=out000.mp4&tr=http%3A%2F%2F172.16.2.55%3A6881%2Fannounce&tr=udp%3A%2F%2F172.16.2.55%3A6881&tr=ws%3A%2F%2F172.16.2.55%3A6881';
    
            // var torrent_opts = {
            //     // announce: [],                       // Torrent trackers to use (added to list in .torrent or magnet uri)
            //     path: __dirname + '/downloaded'     // Folder to download files to (default=`/tmp/webtorrent/`)
            // }
    
            client.add(magnetsArray[index], (torrent) => {
                console.log('Client is downloading: ', torrent.infoHash);
    
                torrent.on('download', (bytes) => {
                    console.log('\njust downloaded: ' + bytes + ' bytes');
                    console.log('total downloaded: ' + (torrent.downloaded / (1024 * 1024)).toFixed(2) + ' MiB');
                    console.log('download speed: ' + (torrent.downloadSpeed / 1024).toFixed(2) + ' KiB/s');
                    console.log('progress: ' + torrent.progress.toFixed(3));
                });
    
                torrent.files[0].appendTo('body', { autoplay: true, muted: true });
                var body = document.getElementById("body");
                body.childNodes[body.childNodes.length - 1].onended = function() {
                    console.log(index);
                    if (index < magnetsArray.length - 1) {
                        console.log("Adding another one...")
                        index++;
                        body.childNodes[body.childNodes.length - 1].remove();
                        getMagnets();
                    } else {
                        // setTimeout(getMagnets(), 5000);
                        alert("No more videos to show");
                    }
                };
            });
            
        }
    })
}

getMagnets();


