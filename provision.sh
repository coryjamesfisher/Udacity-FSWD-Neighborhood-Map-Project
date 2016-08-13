#!/bin/bash

# APT Managed Packages
apt-get -qqy update
apt-get -qqy install nodejs npm

# For some reason Ubuntu installs node as "nodejs" but npm looks for it under "node"
ln -s /usr/bin/nodejs /usr/bin/node

# Install packages from package.json
cd /vagrant/backend && npm install

echo "export PORT=8000" > /etc/profile.d/server_vars.sh
