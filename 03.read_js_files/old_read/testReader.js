var fileReader = require('./read_01.js')

var txtFilename = 'magnets.txt';

fileReader.parseFile(txtFilename, function(err, data){
    if(err) return console.log(err);
    console.log(data);
});