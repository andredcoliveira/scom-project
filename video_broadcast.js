const FFmpeg = require('fluent-ffmpeg')
const WebTorrent = require('webtorrent-hybrid')
const CreateTorrent = require('create-torrent')
const Clivas = require('clivas')
const Path = require('path')
const Glob = require('glob')
const Magnets = require('./magnets')
const Net = require('net')
const FS = require('fs')
const Magnet = require('magnet-uri')

/* Print stack trace on warning */
// process.on('warning', (warning) => {
//     console.warn(warning);
// });

var torrents = [];

process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 0;

if (process.argv.length <= 2 || process.argv.length > 6) {
    console.log('Usage:\n\tnode ' + Path.basename(__filename) + ' <mode> <ip> <port> <runtime (s)>\n\n\tmodes: dht, tracker');
    process.exit(-1);
}

var currMagnetURI = '';
var client;
if (process.argv[2].match(/dht/i)) {
    if (!ValidateIPaddress(process.argv[3])) {
        console.log('Invalid IP Address (\'' + process.argv[3] + '\')');
        process.exit(-1);
    }
    if (process.argv[4] == null || isNaN(process.argv[4]) || process.argv[4] <= 0) {
        console.log('Invalid Port number (\'' + process.argv[4] + '\')');
        process.exit(-1);
    }
    if (process.argv[5] == null || isNaN(process.argv[5]) || process.argv[5] <= 0) {
        console.log('Invalid runtime (\'' + process.argv[4] + '\')');
        process.exit(-1);
    }
    
    var dht_opts = { bootstrap: [`${process.argv[3]}:${process.argv[4]}`] };
    // var dht_opts = { bootstrap: [`172.16.2.14:${process.argv[4]}`] };
    // var dht_opts = { bootstrap: [`router.bittorrent.com:6881`] };
    var client_opts = { tracker: false, dht: dht_opts };
    client = new WebTorrent(client_opts);

    client.dht.on('announce', function(peer, infoHash) {
        var conc = '';
        for (var i = 0; i < infoHash.length; i++) {
            if (parseInt(infoHash[i].toString(10)) < 16) {
                conc = conc + '0';
            }
            conc = conc + infoHash[i].toString(16);
        }
        torrents[conc].addPeer(`${peer.host}:${peer.port}`);
        torrents[conc].resume();
    })

} else if (process.argv[2].match(/tracker/i)) {
    client = new WebTorrent();
} else {
    console.log('Invalid mode (\'' + process.argv[2] + '\')');
    process.exit(-1);
}

global.WEBTORRENT_ANNOUNCE = false;     // force-ignore webtorrent-hybrid's public trackers

var create_opts = {
    private: true,
    announceList: []
}

var download_opts = {
    path: __dirname,
    announce: [
        `http://${process.argv[3]}:${process.argv[4]}/announce`,
        `udp://${process.argv[3]}:${process.argv[4]}`,
        `ws://${process.argv[3]}:${process.argv[4]}`
    ]
}

client.on('error', function (err) {
    console.log(err);
    process.exit(-1);
});

var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// I don't want binary, do you?
stdin.setEncoding('utf8');

// on any data into stdin
stdin.on('data', (key) => {
    // ctrl-c ( end of text )
    if (key === '\u0003') {
        client.destroy((err) => {
            if(!err) {
                gracefulExit();
                process.exit(0);
            } else {
                console.log(err),
                process.exit(-1);
            }
        });
    }
});


var webcam = "";
var microphone = "";
var prefix = 'out';
var segmentTime = 5;
var duration = process.argv[5];

// ffmpeg -list_devices true -f dshow -i dummy
var command = FFmpeg('dummy') // input file
    .output('dummy2') // output file
    .addInputOption('-list_devices true')
    .inputFormat('dshow')
    .on('error', (err, stdout, stderr) => {
        var lines = stderr.split("\n");
        var mic = false;
        var cam = false;
        for(var i = 0; i < lines.length; i++) {
            if(lines[i].match(/microfone/i) || lines[i].match(/microphone/i)) {
                microphone = lines[i].split("\"")[1];
                mic = true;
            }
            if(lines[i].match(/camara/i) || lines[i].match(/webcam/i)) {
                webcam = lines[i].split("\"")[1];
                cam = true;
            }
        }
        if (cam && mic) {
            recordWebcam(webcam, microphone);
        } else if (cam) {
            recordWebcam(webcam);
        }
    });
command.run();

function recordWebcam(webcam, microphone) {
    Clivas.line('{red:> Start recording from webcam: }' + webcam);
    if(microphone) {
        Clivas.line('{red:> Start recording from microphone: }' + microphone);
    }

    if(!microphone) {
        var command = FFmpeg("video=" + webcam)
            .output(prefix + '%03d.mp4')
            .outputFormat('segment')
            .addOutputOption('-segment_time ' + segmentTime)
            .addOutputOption('-movflags faststart')
            .addOutputOption('-preset ultrafast')
            .addOutputOptions([
                '-crf 22', '-g ' + segmentTime,
                '-sc_threshold 0',
                '-force_key_frames expr:gte(t,n_forced*' + segmentTime + ')'
            ])
            .videoCodec("libx264")  // mpeg4; libx264; mpeg2video (streamable)
            .inputFormat("dshow")
            .duration(duration)     // seconds
            .on('end', (stdout, stderr) => {
                Clivas.line('{red:> Creating last torrent...}');
                addSegment(__dirname + '/' + prevFile);
            })
        command.run();
    } else {
        var command = FFmpeg("video=" + webcam + ":audio=" + microphone)
            .output(prefix + '%03d.mp4')
            .outputFormat('segment')
            .addOutputOption('-segment_time ' + segmentTime)
            .addOutputOption('-movflags faststart')
            .addOutputOption('-preset ultrafast')
            .addOutputOptions([
                '-crf 22', '-g ' + segmentTime,
                '-sc_threshold 0',
                '-force_key_frames expr:gte(t,n_forced*' + segmentTime + ')'
            ])
            .videoCodec("libx264")  // mpeg4; libx264; mpeg2video (streamable)
            .audioCodec("libmp3lame")
            .inputFormat("dshow")
            .duration(duration)     // seconds
            .on('end', (stdout, stderr) => {
                Clivas.line('{red:> Creating last torrent...}');
                addSegment(__dirname + '/' + prevFile);
            })
        command.run();
    }
}

var prevFile = '';

var fsWait = false;
FS.watch('.', (event, filename) => {
    if (filename !== prevFile && filename.match(/mp4/i)) {
        if (fsWait) return;
        fsWait = setTimeout(() => {
            fsWait = false;
        }, 100);
        if (prevFile !== '') {
            addSegment(__dirname + '/' + prevFile);
        }
        prevFile = filename;
    }
});

function addSegment(filePath) {
    CreateTorrent(filePath, create_opts, (err, torrBuffer) => {
        if(!err) {
            var torrent = client.add(torrBuffer, download_opts);

            torrent.on('done', () => {
                Clivas.line('{green:Torrent created:} ' + torrent.name);

                var infoHash = Magnet(torrent.magnetURI).infoHash;
                torrents[infoHash] = torrent;

                Magnets.write(torrent.magnetURI + '\n');
                currMagnetURI = torrent.magnetURI;

                console.log(client.torrentPort);
                console.log(client.dhtPort);
            });
        } else {
            console.log(err);
            process.exit(-1);
        }
    });
}

function ValidateIPaddress(ipaddress) {
    return (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress));
}

function gracefulExit() {
    Clivas.line('{red:> [Try to] Destroy all records}');

    server.close();

    var files = Glob.sync(__dirname + '/*.mp4');
    files.forEach(file => {
        try {
            FS.unlinkSync(file);
        } catch (err) {}
    });
    FS.unlinkSync(__dirname + '/magnets.txt');
}

var server = Net.createServer();

server.on('connection', (connection) => {
    connection.setEncoding('utf-8');

    connection.write(currMagnetURI);

    connection.on('data', (data) => {
        console.log('Recebido: ', data.toString());
        connection.write(currMagnetURI);
    });

    connection.on('error', (error) => {
        console.log(error);
    });
});

server.listen(8991, process.argv[3]);