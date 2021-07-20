export const defaultIgnoreRules = [
  'OPTIONS (.*)',
  'HEAD (.*)',
  'GET (.*).htm',
  'GET (.*).html',
  'GET (.*).ico',
  'GET (.*).css',
  'GET (.*).js',
  'GET (.*).woff',
  'GET (.*).woff2',
  'GET (.*).png',
  'GET (.*).jpg',
  'GET (.*).jpeg',
  'GET (.*).svg',
  'GET (.*).gif',
];

export const defaultIgnoreFile = `
# Default Ignore Rules
# Learn to configure your own at https://www.useoptic.com/reference/optic-yaml/ignore
${defaultIgnoreRules.join('\n')}
`.trim();
