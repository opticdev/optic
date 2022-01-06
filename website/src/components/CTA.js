import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Container, Paper, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { useFeatureStyles } from './featureStyles';
import Box from '@material-ui/core/Box';
import Link from '@docusaurus/core/lib/client/exports/Link';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { UpdatedBlueBackground } from './theme';
import Grid from '@material-ui/core/Grid';
import { links } from './links';

export const useStyles = makeStyles({
  section: {
    paddingTop: 100,
    paddingBottom: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 25,
    fontWeight: 300,
    marginTop: 14,
    textAlign: 'center',
  },
  headline: {
    marginTop: 25,
    fontWeight: 800,
    textAlign: 'center',
  },
  link: {
    fontSize: 24,
    fontWeight: 600,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});

export function CTATryOptic() {
  const classes = useStyles();
  const featuredStyles = useFeatureStyles();
  return (
    <div className={classes.section}>
      <Container maxWidth="lg">
        <Grid container xs={12}>
          <Grid item xs={12} sm={5}>
            <img
              src="/img/Optic_Graphic2.svg"
              width="400"
              style={{ marginRight: 30 }}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Typography variant="h1" className={featuredStyles.headline}>
              We're here to help your team build a great API
            </Typography>
            <Typography variant="h1" className={featuredStyles.subtext}>
              Explore our docs and read about the workflows Optic enables. When
              you are ready, set Optic up (it takes 10 mins) or have a
              conversation with the Optic maintainers for help.
            </Typography>
            <Box style={{ marginTop: 5, marginBottom: 120 }}>
              <Box
                alignItems="center"
                display="flex"
                flexDirection="row"
                justifyContent="flex-start"
              >
                <a className={'button button--primary'} href={links.DocsRoot}>
                  Get Started
                </a>

                <div style={{ marginLeft: 10 }}>
                  <Link href={links.Demo}>Schedule a Demo</Link>
                </div>
              </Box>
              <Typography
                variant="body1"
                style={{ color: '#6d757d', marginTop: 20 }}
              >
                When the CLI is installing, be sure to{' '}
                <Link href={links.Community}>join the community.</Link>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export function MiniCTA() {
  return (
    <Paper
      elevation={0}
      style={{
        backgroundColor: UpdatedBlueBackground,
        padding: 12,
        display: 'flex',
        alignItems: 'center',
        border: '1px solid #e2e2e2',
        marginBottom: 40,
        marginTop: 100,
      }}
    >
      <div>
        <Typography variant="subtitle1" style={{ fontWeight: 800 }}>
          Featured Tutorial (15 mins):{' '}
          <b>Document your API using real traffic</b>
        </Typography>
        <Typography variant="caption" style={{ fontSize: 12 }}>
          Learn how to add Optic to an existing API and document all the
          endpoints in minutes.
        </Typography>
      </div>
      <div style={{ flex: 1 }} />
      <div>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
        >
          <div style={{ marginRight: 20 }}>
            <Link href={links.Demo}>Schedule a Demo</Link>
          </div>
          <a className={'button button--primary'} href={links.DocumentAPI}>
            Get Started
          </a>
        </Box>
      </div>
    </Paper>
  );
}
