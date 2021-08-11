import React from 'react';
import Helmet from 'react-helmet';
import BrowserOnly from '@docusaurus/core/lib/client/exports/BrowserOnly';

export function SetTwitterSocial(props) {
  return (
    <BrowserOnly
      children={() => {
        return (
          <Helmet>
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={props.image} />
            <meta name="twitter:site	" content="@useoptic" />
            <meta name="twitter:creator	" content="@aidandcunniffe" />
          </Helmet>
        );
      }}
    />
  );
}
