const { generate } = require('./helper');

const documentLinkTemplate = (slug) =>
  `reference/capture-methods/using-integration/${slug}`;
const documentTemplate = (name, slug, path, link, metadata) => {
  const tabValuesAsString = metadata.middleware_url
    ? [
        { label: 'Using Middleware', value: 'middleware' },
        { label: 'Using Proxy', value: 'manual' },
      ]
    : [
        { label: 'Using Proxy', value: 'manual' },
        { label: 'Using Middleware (coming soon)', value: 'middleware' },
      ];

  return `
---
title: Capture traffic from ${name}
sidebar_label: ${name}
slug: /${link}
---

import SpecificExample from '${path}';

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import BrowserOnly from '@docusaurus/core/lib/client/exports/BrowserOnly';


<BrowserOnly children={() => (<Tabs
  defaultValue={metadata.middleware_url ? 'middleware' : 'manual'}
  values={${JSON.stringify(tabValuesAsString)}}>

<TabItem value="middleware">
<SpecificExample middleware={true} />
</TabItem>

<TabItem value="manual">
<SpecificExample proxy={true} />
</TabItem>

</Tabs>)
} />

`;
};

module.exports = generate(
  'frameworks',
  ['../docs', 'frameworks'],
  documentTemplate,
  documentLinkTemplate,
  [
    __dirname,
    '../',
    'docs',
    'reference',
    'capture-methods',
    'using-integration',
  ]
);
