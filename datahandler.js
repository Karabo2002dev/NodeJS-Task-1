
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'mediaData.json');

function initDataFile() {
  if (!fs.existsSync(dataPath)) {
    const initialData = {
      movies: [],
      series: [],
      songs: []
    };
    fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
  }
}

function readData() {
  return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = { initDataFile, readData, writeData };
