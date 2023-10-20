#!/bin/sh

# Clean up from last install
rm -rf includes
rm -rf templates
rm -rf data
rm -rf dist
rm -rf assets
rm -rf libraries
rm -rf docs
wget https://github.com/maverickengine/summary-engine/archive/refs/heads/main.zip
unzip main.zip
rm main.zip
rm summary-engine-main/README.md
mv summary-engine-main/* .
rm -rf summary-engine-main
npm install
npm run build
npm run docs
rm -rf src
rm -rf node_modules