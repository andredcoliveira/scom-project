var Net = require('net');
var cp = require('child_process');
var VlcCommand = require('vlc-command')
var DHT = require('bittorrent-dht')
var Magnet = require('magnet-uri')

var ip = process.argv[2];
var port = 8991;
console.log ("Reaching broadcaster on port 8991...");

var cmd2Execute1 = '';
var cmd2Execute2 = '';
var cmdDelete = '';
var path = 'videos';
var filename = "";
var oldMagnet = "";

var dht = new DHT({bootstrap: ['172.16.2.14:6881']})
dht.listen(51448, function () {
    console.log('Now Listening...')
})

VlcCommand(function (err, cmdPath) {
    if (err) return console.error('Could not find vlc command path');
    // Check OS type
    if (process.platform == "darwin") {
        console.log('You are on MacOS');
        cmdDelete = 'rm';
        cmd2Execute1 = `./node_modules/.bin/webtorrent-hybrid download "`;
        cmd2Execute2 = `" -o "${path}/" && sleep 1 && ${cmdPath} --play-and-exit ${path}/`;
    } else if (process.platform == "win32") {
        console.log('You are on WindowsOS');
        cmdDelete = 'del';
        cmd2Execute1 = `node_modules\\.bin\\webtorrent-hybrid download "`;
        cmd2Execute2 = `" -q -o "${path}/" && ping 127.0.0.1 -n 1 -w 1000 > nul && "${cmdPath}" -f --one-instance ${path}/`;
    } else {
        console.log("Unknown OS");
        return;
    }
    cp.exec(`${cmdDelete} ${path}/*`, (err, stdout, stderr) => {
        if (err) { // node couldn't execute the command
            console.log("Files not found. Do not have any videos to delete.");
            return;
        }
    });
});

var client = new Net.Socket();
client.setTimeout(1000); // Check for magnets updates every 1 sec

client.on('timeout', () => {
    client.write("Server, do you have any new magnet link for me?");
})
client.connect(port, ip, function() {
    console.log('Connected');
});

client.on('data', function(data) {
    if (data.toString() !== oldMagnet) {
        console.log('New magnet link: ', data.toString());
        dht.announce(Magnet(data.toString()).infoHash);
        filename = data.slice(data.indexOf("&dn=") + 4, data.indexOf(".mp4") + 4);
        cp.exec(`${cmd2Execute1}${data}${cmd2Execute2}${filename}`, (err, stdout, stderr) => {
        if (err) { // node couldn't execute the command
                console.log(err);
                return;
            }
        });
        oldMagnet = data.toString();
    }
});

client.on('close', function() {
	console.log('Connection closed');
});
