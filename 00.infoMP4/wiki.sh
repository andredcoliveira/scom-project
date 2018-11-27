# Windows using VLC
"C:\Program Files (x86)\VideoLan\VLC\vlc.exe" 1.mp4 2.mp4 --sout "#gather:std{access=file,dst=3.mp4}" --sout-keep

# Download ffpmeg from ffmpeg.zeranoe.com/builds (64bit static version)
# Copy the <zippedFolder>/bin/ffmpeg.exe to the folder that has the videos
(for i in *.mp4; do echo file \'$i\'; done) > mylist.txt
ffmpeg -f concat -i mylist.txt -c copy output.mp4

# ffmpeg
ls Sample* | perl -ne 'print "file $_"' | ffmpeg -f concat -i - -c copy Movie_Joined.mp4
