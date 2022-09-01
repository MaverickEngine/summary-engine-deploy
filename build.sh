#!/bin/sh

rm -rf includes
rm -rf templates
rm -rf data
rm -rf dist
rm -rf assets
wget https://github.com/maverickengine/summary-engine/archive/refs/heads/main.zip
unzip main.zip
rm main.zip
rm summary-engine-main/README.md
mv summary-engine-main/* .
rm -rf summary-engine-main
npm install
npm run build
rm -rf src
rm -rf node_modules