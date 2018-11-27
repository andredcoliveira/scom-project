const fs = require('fs');
const VideoLib = require('node-video-lib');

fs.open('video.mp4', 'r', function(err, fd) {
    try {
        let movie = VideoLib.MovieParser.parse(fd);
        // Work with movie
        console.log('Duration:', movie.relativeDuration());
    } catch (ex) {
        console.error('Error:', ex);
    } finally {
        fs.closeSync(fd);
    }
});