const fs = require('fs');

async function parseData(file) {
    return JSON.parse(fs.readFileSync(file));
}

async function saveData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports = {parseData, saveData}