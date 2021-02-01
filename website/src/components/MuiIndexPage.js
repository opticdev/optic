import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import HomePageHero from './HomePageHero';
import theme from './theme';
import { DocumentGitHubExample, GitBotDemo } from './CommandDemo';
import { ApiDemo, ApiSpecsEverywhere } from './APISpecsEverywhere';
import { DeveloperFriendly } from './DeveloperFriendly';
import Divider from '@material-ui/core/Divider';
import { CTATryOptic } from './CTA';
import { Download } from './Download';

export const MuiThemeProvider = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const SplashPage = () => {
  return (
    <MuiThemeProvider>
      <HomePageHero />

      <ApiDemo />

      <Divider style={{ marginTop: 90, marginBottom: 90 }} />

      <ApiSpecsEverywhere />
      <Divider style={{ marginTop: 90, marginBottom: 90 }} />

      <DeveloperFriendly />
      <GitBotDemo />

      <DocumentGitHubExample />

      <Divider style={{ marginTop: 90, marginBottom: 90 }} />

      <CTATryOptic />
    </MuiThemeProvider>
  );
};
