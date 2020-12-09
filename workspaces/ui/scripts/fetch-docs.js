const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function loadDocs(url, name) {
  const jsonContent = await fetch(url).then((res) => res.json());
  const fileName = path.join(
    __dirname,
    '../src/components/setup-page/fetch-docs/loaded',
    name + '.json'
  );
  fs.writeFile(fileName, JSON.stringify(jsonContent, null, 4), (e) =>
    console.log('Docs written to: ' + fileName)
  );
}

//build time docs import
loadDocs('https://useoptic.com/setup-config.json', 'setup');
loadDocs('https://useoptic.com/common-issues.json', 'common-issues');
