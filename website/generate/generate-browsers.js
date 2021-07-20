const { generate } = require('./helper');

const documentLinkTemplate = (slug) =>
  `reference/capture-methods/browsers/${slug}`;
const documentTemplate = (name, slug, path, link) => `
---
title: Capture traffic from ${name} Network Tab
sidebar_label: ${name}
slug: /${link}
---

import SpecificExample from '${path}';

<SpecificExample />

`;

module.exports = generate(
  'browsers',
  ['../docs', 'browsers'],
  documentTemplate,
  documentLinkTemplate,
  [__dirname, '../', 'docs', 'reference', 'capture-methods', 'browsers']
);
