import makeStyles from '@material-ui/styles/makeStyles';
import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import { useFeatureStyles } from './featureStyles';
import { GitHubStats } from './GitHubStatsSlim';
import { Paper } from '@material-ui/core';
import { MiniCTA } from './CTA';

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo('en-US');

const Headlines = {
  headline: 'Optic documents your APIs\n as you develop them',
  subtext:
    'Updating API specifications should be as easy as making a Git commit.',
  subtext1:
    'API changelogs should be a part of every PRs, with breaking changes caught in CI.',
  siteDescription:
    'Open Source Tool that make API specifications as easy to use as Git.',
  featuredSlug: '/blog/git-for-apis',
  featured2Slug: '/blog/optic-se-daily',
  siteHeadline: 'APIs that Document and Test Themselves',
};

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 90,
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
    backgroundImage: `url('/img/svg-bg.svg')`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: '95% 60%',
    backgroundAttachment: 'local',
    backgroundSize: '120px 120px',
    [theme.breakpoints.down('md')]: {
      backgroundImage: 'none',
    },
  },
  textWrap: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  card: {
    minHeight: 190,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 12,
  },
  mini: {
    fontWeight: 100,
    color: '#6d757d',
    fontFamily: 'Ubuntu Mono',
    fontSize: 18,
    marginLeft: 2,
  },
  when: {
    fontWeight: 100,
    color: '#6d757d',
    fontFamily: 'Ubuntu Mono',
    fontSize: 14,
    marginLeft: 3,
  },
  button: {
    marginTop: 9,
  },
  download: {
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  oss: {
    fontSize: 14,
    color: '#6d757d',
    fontFamily: 'Ubuntu Mono',
    fontWeight: 800,
    textAlign: 'left',
  },
  copyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
}));

function HomePageHero(props) {
  const classes = useStyles();
  const featuredClasses = useFeatureStyles();

  return (
    <div style={{ paddingBottom: 70 }}>
      <Container maxWidth="lg" fullWidth className={classes.root}>
        <Container maxWidth="md" className={classes.copyContainer}>
          <Typography variant="subtitle1" className={featuredClasses.mini}>
            Meet Optic
          </Typography>
          <Typography variant="h1" className={featuredClasses.headline}>
            Understand your APIs, know when they change
          </Typography>
          <Typography variant="h1" className={featuredClasses.subtext}>
            Optic watches real traffic to understand your API behavior and helps
            developers with API documentation and testing. With Optic every
            API change is documented, reviewed, and approved before getting
            deployed.
          </Typography>

          <GitHubStats style={{ marginTop: 20 }} />
        </Container>
      </Container>

      <Container maxWidth="lg" fullWidth>
        <Paper elevation={2} style={{ display: 'flex' }}>
          <img src={'/img/optic-image.png'} />
        </Paper>
      </Container>

      <Container maxWidth="md" fullWidth>
        <MiniCTA />
      </Container>
    </div>
  );
}

export default HomePageHero;
