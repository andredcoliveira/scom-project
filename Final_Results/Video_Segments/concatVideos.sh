#!/bin/bash
(for i in all_segm_videos/*.mp4; do echo file \'$i\'; done) > listOfVideos.txt
ffmpeg -f concat -i listOfVideos.txt -c copy concatenatedVideo.mp4
