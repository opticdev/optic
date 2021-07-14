const { generate } = require('./helper');

const documentLinkTemplate = (slug) =>
  `reference/capture-methods/tools/${slug}`;
const documentTemplate = (name, slug, path, link) => `
---
title: Capture Traffic from ${name}
sidebar_label: ${name}
slug: /${link}
---

import SpecificExample from '${path}';

<SpecificExample />

`;

module.exports = generate(
  'tools',
  ['../docs', 'tools'],
  documentTemplate,
  documentLinkTemplate,
  [__dirname, '../', 'docs', 'reference', 'capture-methods', 'tools']
);
