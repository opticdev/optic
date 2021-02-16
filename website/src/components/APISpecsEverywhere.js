import { useFeatureStyles } from './featureStyles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormatCopy } from './FormatCopy';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import { useStyles } from './CommandDemo';
import { Quote } from './Credo';
import { Paper } from '@material-ui/core';

const copy = require('./demo-copy.json');

const Quotes = [
  {
    name: 'Kin Lane',
    title: 'The API Evangelist\nChief Evangelist, Postman',
    quote:
      'Optic is a smart, simple, and straightforward solution to a real world problem every company faces.',
    pic: '/people/kinface.jpg',
  },
  {
    name: 'Zdenek Nemec',
    title: 'FOUNDER GOOD API\nCREATOR OF API BLUEPRINT',
    quote:
      'Traffic-driven API development and ops is the the future of handling the skyrocketing complexity of API landscapes. Thats is why I am really excited to see efforts like Optic.',
    pic: '/people/zface.jpeg',
  },
];

export function ApiDemo() {
  const featuredStyles = useFeatureStyles();
  const classes = useStyles();

  return (
    <Container
      maxWidth="lg"
      className={classes.gitBotContainer}
      style={{ marginBottom: 120 }}
    >
      <Grid container xs={12}>
        <Grid xs={12} md={6} item className={classes.spacingRightLarge}>
          <Typography
            variant="subtitle2"
            style={{
              fontFamily: 'Ubuntu Mono',
              fontWeight: 800,
              marginBottom: 14,
            }}
            component="div"
          >
            API CLI makes documenting endpoints and detecting changes easy
          </Typography>

          <Paper elevation={4} style={{ overflow: 'hidden', maxHeight: 350 }}>
            <img src="/img/status.svg" />
          </Paper>
        </Grid>
        <Grid xs={12} md={6} item className={classes.spacingTopLarge}>
          <Typography
            variant="subtitle2"
            style={{
              fontFamily: 'Ubuntu Mono',
              fontWeight: 800,
              marginBottom: 14,
            }}
            component="div"
          >
            Review API diffs in Optic's interactive GUI
          </Typography>

          <Paper elevation={4} style={{ overflow: 'hidden', maxHeight: 350 }}>
            <img src="/img/big-diff.png" />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export function ApiSpecsEverywhere() {
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
          <FormatCopy value={copy.everywhere.heading} />
        </Typography>
        <Typography variant="subtitle2" className={featuredStyles.descriptions}>
          <FormatCopy value={copy.everywhere.description} />

          <Typography
            variant="subtitle2"
            component="div"
            style={{ marginTop: 20 }}
          >
            our project is built around core principles:{' '}
          </Typography>
          <ul style={{ marginTop: 15 }}>
            <li>
              Working with API specifications should be developer-friendly &
              accessible to everyone
            </li>
            <li>
              Documenting new endpoints should feel like Git-adding a file
            </li>
            <li>
              Every API change should be easy to document and review in Pull
              Requests
            </li>
          </ul>
        </Typography>

        {/*<Container maxWidth="sm" fullWidth style={{ textAlign: 'left' }}>*/}
        {/*  <Quote {...Quotes[0]} />*/}
        {/*</Container>*/}

        <Grid
          container
          style={{ textAlign: 'left', paddingTop: 0 }}
          spacing={2}
        >
          <Grid item xs={12} md={6}>
            <Quote {...Quotes[0]} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Quote {...Quotes[1]} />
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}
