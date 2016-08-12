#!/bin/bash

# APT Managed Packages
apt-get -qqy update
apt-get -qqy install nodejs npm

cd /vagrant/backend && npm install
