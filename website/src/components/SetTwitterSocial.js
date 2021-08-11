import React from 'react';
import { NoSsr } from '@material-ui/core';
import Helmet from 'react-helmet';

export function SetTwitterSocial() {
  return (
    <NoSsr>
      <Helmet>
        <head name="twitter:card" content="summary_large_image" />
      </Helmet>
    </NoSsr>
  );
}
