import React from 'react';
import { ThemeProvider } from '@material-ui/core';
import HomePageHero from './HomePageHero';
import theme from './theme';
import { ApiDemo, ApiSpecsEverywhere, QuotesAll } from './APISpecsEverywhere';
import { DeveloperFriendly } from './DeveloperFriendly';
import Divider from '@material-ui/core/Divider';
import { CTATryOptic } from './CTA';
import { Download } from './Download';
import Container from '@material-ui/core/Container';
import {
  ChangeValueProp,
  DocumentValueProp,
  TestValueProp,
  ValuePropRegion,
} from './ValuePropRegion';
import { ToolsSupported } from './ToolsSupported';
import { GridSupport } from './GridSupport';

export const MuiThemeProvider = ({ children }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export const SplashPage = () => {
  return (
    <MuiThemeProvider>
      <HomePageHero />

      <Divider />

      <QuotesAll />

      <Divider style={{ marginBottom: 90 }} />

      <DocumentValueProp />
      <ChangeValueProp />
      <TestValueProp />

      <Divider style={{ marginTop: 90 }} />

      <ToolsSupported />
      <Divider />

      <GridSupport />
      <Divider />

      <CTATryOptic />
    </MuiThemeProvider>
  );
};
