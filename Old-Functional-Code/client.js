var net = require('net');
var {exec} = require('child_process');

// TODO: change ip to argument command line
var ip = '172.16.2.55';
var port = 8991;
let filename = "";
let oldMagnet = "";

exec(`rm *.mp4`, (err, stdout, stderr) => {
    if (err) {
        // node couldn't execute the command
        console.log(err);
        return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

var client = new net.Socket();
client.setTimeout(1000);

client.on('timeout', () => {
    client.write("André Escuta...");
})
client.connect(port, ip, function() {
    console.log('Connected');
});

client.on('data', function(data) {
    if(data.toString() !== oldMagnet) {
      console.log('Recebido novo: ', data.toString());
    }
    if (data.toString() !== oldMagnet) {
          filename = data.slice(data.indexOf("&dn=") + 4, data.indexOf(".mp4") + 4);
          console.log(filename);
          exec(`./../node_modules/.bin/webtorrent-hybrid download "${data}" -q && sleep 1 && /Applications/VLC.app/Contents/MacOS/VLC --play-and-exit ${filename}`, (err, stdout, stderr) => {
        //   exec(`./../node_modules/.bin/webtorrent-hybrid download "${data}" -q --vlc --play-and-exit`, (err, stdout, stderr) => {
            if (err) {
                  // node couldn't execute the command
                  console.log(err);
                  return;
              }
              // the *entire* stdout and stderr (buffered)
              console.log(`stdout: ${stdout}`);
              console.log(`stderr: ${stderr}`);
          });

        oldMagnet = data.toString();
    }
});

client.on('close', function() {
	console.log('Connection closed');
});
