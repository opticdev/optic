import React, { useState } from 'react';
import { useFeatureStyles } from './featureStyles';
import Typography from '@material-ui/core/Typography';
import TextLoop from 'react-text-loop';
import { FormatCopy } from './FormatCopy';
import makeStyles from '@material-ui/styles/makeStyles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import IconGrid, { TextWithSubtext } from './IconGrid';
import { Tab, Tabs } from '@material-ui/core';
import { IFrameDemo2 } from './iFrameDemo2';
import Box from '@material-ui/core/Box';

const copy = require('./demo-copy.json');

export const useStyles = makeStyles((theme) => ({
  command: {
    textAlign: 'left',
    fontSize: 35,
    fontFamily: 'Ubuntu Mono',
  },
  caption: {
    textAlign: 'left',
    fontSize: 22,
    fontFamily: 'Inter',
    color: '#5a5e65',
    paddingLeft: 2,
    paddingTop: 4,
  },
  left: {
    borderRight: '1px solid #dcdcdc',
    paddingRight: 12,
    flex: 1,
  },
  right: {
    paddingLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Ubuntu Mono',
    color: '#5a5e65',
    fontSize: 20,
    width: 175,
    fontWeight: 100,
    display: 'flex',
  },
  gitBotContainer: {
    textAlign: 'center',
    marginBottom: 60,
  },
  gitBotBenefits: {
    [theme.breakpoints.down('sm')]: {
      paddingTop: 50,
      maxWidth: 500,
      justifyContent: 'center',
      margin: '0 auto',
      alignItems: 'flex-start',
    },
    paddingLeft: 30,
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  spacingRightLarge: {
    [theme.breakpoints.up('md')]: {
      paddingRight: 20,
    },
    [theme.breakpoints.up('sm')]: {
      maxHeight: 350,
    },
  },
  spacingTopLarge: {
    [theme.breakpoints.down('md')]: {
      paddingTop: 80,
    },
    [theme.breakpoints.up('sm')]: {
      maxHeight: 350,
    },
  },
}));

export function GitBotDemo() {
  const featuredStyles = useFeatureStyles();
  const classes = useStyles();

  return (
    <Container maxWidth={false} className={classes.gitBotContainer}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          className={featuredStyles.headline}
          style={{
            fontWeight: 300,
            fontSize: 45,
            textAlign: 'left',
            fontFamily: 'Ubuntu Mono',
          }}
        >
          <FormatCopy value={copy.gitbot.heading} />
        </Typography>
        <Typography variant="subtitle2" className={featuredStyles.descriptions}>
          {copy.gitbot.description}
        </Typography>

        <Grid container>
          <Grid item xs={12} sm={12} md={7}>
            <img src={'/img/gitbot.png'} width="100%" />
          </Grid>
          <Grid item xs={12} sm={12} md={5}>
            <div className={classes.gitBotBenefits}>
              {copy.gitbot.benefits.map((i) => {
                return <TextWithSubtext title={i.title} subtext={i.subtext} />;
              })}
            </div>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}

export function DocumentGitHubExample() {
  const featuredStyles = useFeatureStyles();
  const classes = useStyles();

  const [tab, setTab] = useState(0);

  const demoUrl =
    tab === 0 ? '/demos/github/review' : '/demos/github-with-diffs/review';

  return (
    <>
      <Container
        maxWidth={false}
        className={classes.gitBotContainer}
        style={{ marginBottom: 0 }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            className={featuredStyles.headline}
            style={{
              fontWeight: 300,
              fontSize: 45,
              textAlign: 'left',
              fontFamily: 'Ubuntu Mono',
            }}
          >
            <FormatCopy value={copy.example.heading} />
          </Typography>
          <Typography
            variant="subtitle2"
            className={featuredStyles.descriptions}
            style={{ marginBottom: 10 }}
          >
            {copy.example.description}
          </Typography>

          <Tabs
            value={tab}
            color="secondary"
            onChange={(e, value) => setTab(value)}
          >
            <Tab value={0} label="Document GitHub in 3 mins." />
            <Tab value={1} label="Review an API Diff Optic Found" />
          </Tabs>
        </Container>
      </Container>
      <IFrameDemo2 url={demoUrl} />
    </>
  );
}
