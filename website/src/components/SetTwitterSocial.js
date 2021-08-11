import React from 'react';
import Helmet from 'react-helmet';
import BrowserOnly from '@docusaurus/core/lib/client/exports/BrowserOnly';

export function SetTwitterSocial() {
  return (
    <BrowserOnly
      children={() => {
        <Helmet>
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:site	" content="@useoptic" />
          <meta property="twitter:creator	" content="@aidandcunniffe" />
        </Helmet>;
      }}
    />
  );
}
