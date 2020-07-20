const fs = require('fs');

const myArgs = process.argv.slice(2);
const debugCaptureFilePath = myArgs[0];

const json = JSON.parse(fs.readFileSync(debugCaptureFilePath, 'utf8'));
console.log(json);
console.log(
  `removing ${json.events.length} events from ${debugCaptureFilePath}`
);
json.events = [];
fs.writeFileSync(debugCaptureFilePath, JSON.stringify(json, null, 2));
console.log('saved!');
