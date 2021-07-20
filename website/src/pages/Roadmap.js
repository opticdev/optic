import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import theme from '../components/theme';
import Layout from '@theme/Layout';

export const MuiThemeProvider = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default () => {
  return (
    <Layout title="Roadmap">
      <MuiThemeProvider>
        <iframe
          src="https://portal.productboard.com/qxafva1nrcpg63vesmuvuwfj"
          frameBorder="0"
          width="100%"
          height="1000"
        ></iframe>
      </MuiThemeProvider>
    </Layout>
  );
};
