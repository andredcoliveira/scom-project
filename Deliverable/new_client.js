var net = require('net');
var cp = require('child_process');
var os = require('os');
var vlcCommand = require('vlc-command')
 
var cmd2Execute = '';
var cmdPath = '';
var cmdDelete = '';
vlcCommand(function (err, cmd) {
    if (err) return console.error('Could not find vlc command path');
    if (process.platform == "win32") {
        cmdDelete = 'del';
    } else {
        cmdDelete = "rm";
    }
	cmdPath = cmd;
});

var ip = process.argv[2];
var port = process.argv[3];
var path = 'videos';
var filename = "";
var oldMagnet = "";

cp.exec(`${cmdDelete} ${path}/*.mp4`, (err, stdout, stderr) => {
    if (err) { // node couldn't execute the command
        console.log("Files not found. Do not have any videos to delete.");
        return;
    }
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
});

var client = new net.Socket();
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
        filename = data.slice(data.indexOf("&dn=") + 4, data.indexOf(".mp4") + 4);

        // Check OS type
        if (os.platform == 'darwin') {
            console.log("You are on a MacOS");
			// cmd2Execute = `./../node_modules/.bin/webtorrent-hybrid download "${data}" --vlc --play-and-exit`;
			cmd2Execute = `./../node_modules/.bin/webtorrent-hybrid download "${data}" -q -o "${path}/" && sleep 1 && ${cmdPath} --play-and-exit ${path}/${filename}`;
        } else if (os.platform == 'win32'){
			console.log("You are on a WindowsOS");
			cmd2Execute = `node_modules\\.bin\\webtorrent-hybrid download "${data} -q -o "${path}/" && ping 127.0.0.1 -n 1 -w 1000 > nul && "${cmdPath}" -f --one-instance ${path}/${filename}`;
        } else {
            console.log("Unknown OS");
            return;
        }
        cp.exec(cmd2Execute, (err, stdout, stderr) => {
        if (err) { // node couldn't execute the command
                console.log(err);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        oldMagnet = data.toString();
    }
});

client.on('close', function() {
	console.log('Connection closed');
});
