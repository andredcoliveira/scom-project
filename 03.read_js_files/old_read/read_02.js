var fs = require('fs'),
	readbytes = 0,
	file;

fs.open(process.argv[2], 'r', function(err, fd) { file = fd; readsome(); });

let pos = 0;
let num = 0;

var stream = fs.createWriteStream('received.txt', {flags:'a'});

function readsome() {
    var stats = fs.fstatSync(file); // async does not make sense!
    if (stats.size < readbytes+1) {
        console.log('Nothing to read... Waiting...');
        setTimeout(readsome, 3000);
    }
    else {
        fs.read(file, new Buffer(bite_size), 0, bite_size, readbytes, processsome);
    }
}

function processsome(err, bytecount, buff) {
	pos = buff.toString('utf-8', 0, bytecount).indexOf(".mp4");
	num = parseInt(buff.toString('utf-8', 0, bytecount).slice(pos - 2, pos));
	stream.write(num + '\n');
	console.log(buff.toString('utf-8', 0, bytecount));

    readbytes += bytecount;
    process.nextTick(readsome);
}