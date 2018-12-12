# scom-project

## BitTorrent Based Live Streaming

Run **setup1.sh** to check if node.js is installed in your computer.
```
chmod +x setup1.sh
./setup1.sh
```

After node.js is installed, run **setup2.sh** for npm to install all dependencies.
```
chmod +x setup2.sh
./setup2.sh
```

Follow the printed guidelines in the console to run a *Client* (client.js) or the *Broadcaster* (broadcast.js).

Read the Report to understand the arquitecture that was implemented, the methods used and the usage of each javascript file.

**Note:** The script *concatVideos.sh* will concat the segments displayed. You just need to copy the files in the directory */videos/* to the directory */Final_Results/Video_Segments/all_segm_videos/* and the video segments concatenated will be displayed in the file *concatenatedVideo.mp4*. This is a complement to the project for people wanting to keep the video stream.
