const { generate } = require('./helper');

const documentLinkTemplate = (slug) => `reference/scripts/${slug}`;
const documentTemplate = (name, slug, path, link) => `
---
title: Export your specification to ${name}
sidebar_label: ${name}
slug: /${link}
---

import SpecificExample from '${path}';

<SpecificExample />

`;

module.exports = generate(
  'scripts',
  ['../docs', 'scripts'],
  documentTemplate,
  documentLinkTemplate,
  [__dirname, '../', 'docs', 'reference', 'scripts']
);
