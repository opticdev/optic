import React from 'react';
import { NoSsr } from '@material-ui/core';
import Helmet from 'react-helmet';

export function SetTwitterSocial() {
  return (
    <NoSsr>
      <Helmet>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site	" content="@useoptic" />
        <meta name="twitter:creator	" content="@aidandcunniffe" />
      </Helmet>
    </NoSsr>
  );
}
