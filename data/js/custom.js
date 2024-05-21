const fs = require('fs');

function parseData(file) {
    return JSON.parse(fs.readFileSync(file));
}

function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {parseData, saveData}