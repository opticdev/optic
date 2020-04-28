import { appTheme } from '../../theme';
import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

export default function theme(story) {
  return <ThemeDecorator story={story} />;
}

function ThemeDecorator({ story }) {
  return (
    <React.Fragment>
      <CssBaseline />
      <ThemeProvider theme={appTheme}>{story()}</ThemeProvider>
    </React.Fragment>
  );
}
