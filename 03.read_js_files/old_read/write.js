var fs = require('fs'),
    lineno=0;

var stream = fs.createWriteStream('test-read-write.txt', {flags:'a'});

stream.on('open', function() {
    console.log('Stream opened, will start writing in 2 secs');
    setInterval(function() { stream.write('magnet:?xt=urn:btih:83f947976cb8adba5634cbd6794d40393220e018&dn=out00' + ++lineno + '.mp4 \n'); }, 2000);
});
