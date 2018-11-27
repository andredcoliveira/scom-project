#!/bin/bash

# Verify that npm is up to date (needs 'sudo')
npm install npm@latest -g

# Create package.json automatically
npm init -y

# Permission to edit
chmod -R 777 .

# Add common modules
npm install webtorrent-hybrid
npm install bittorrent-tracker
npm install dht-bootstrap
npm install bittorrent-dht
npm install net

# Add npm packages in client side
npm install child_process
npm install os
npm install vlc-command
npm install magnet-uri

# Add npm packages in broadcast side
npm install fluent-ffmpeg
npm install glob

npm audit fix

# check installed npm packages
npm list --depth=0

echo -e "to run client:\n\t\t npm client.js <ip>"

echo -e "to run server:\n\t\t npm broadcast.js [tracker || dht] <ip> <tracker/dht port>"