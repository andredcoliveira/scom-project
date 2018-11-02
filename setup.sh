#!/bin/bash

# Check if script is running as 'root'
if (( $EUID != 0 )); then
    echo "Please run as root. (e.g.: use 'sudo' command)"
    exit
fi

RELEASE=$(lsb_release -a -s 2>/dev/null)

# Install Node.js v11.x:
if [[ "$RELEASE" =~ "Ubuntu" ]]; then
#   Using Ubuntu
  curl -sL https://deb.nodesource.com/setup_11.x | sudo -E bash -
  sudo apt-get install -y nodejs
elif [[ "$RELEASE" =~ "Debian" ]]; then
#   Using Debian, ensure root
  curl -sL https://deb.nodesource.com/setup_11.x | bash -
  apt-get install -y nodejs
else
  echo -e "Need to install Nodejs manually. Check your distribution and follow the official instructions:\n\thttps://nodejs.org/en/download/package-manager/"
  exit
fi

# Verify that npm is up to date (needs 'sudo')
npm install npm@latest -g

# Create package.json automatically
npm init -y

# Install 'torrent-stream'
npm install torrent-stream

# Permission to edit
chmod -R 777 .
