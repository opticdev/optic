import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import { Container, Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';

import { useFeatureStyles } from './featureStyles';
import { FormatCopy } from './FormatCopy';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import ForumIcon from '@material-ui/icons/Forum';
import Link from '@docusaurus/core/lib/client/exports/Link';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {GitHubStats} from './GitHubStatsSlim';
export const useStyles = makeStyles({
  section: {
    paddingTop: 75,
    paddingBottom: 75,
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

const tryOptic = {
  title: "API-first workflows built for awesome developers. **Try Adding Optic to your API**",
  subtext: 'Setup takes 5-10 mins.',
  description:
    'When the CLI is installing, be sure to join the community.',
};


export function CTATryOptic() {
  const classes = useStyles();
  const featuredStyles = useFeatureStyles();
  return (
    <Container maxWidth="md" style={{marginBottom: 110}}>
      <Typography
        variant="h4"
        className={featuredStyles.headline}
        style={{
          fontWeight: 300,
          fontSize: 45,
          textAlign: 'left',
        }}
      >
        <FormatCopy value={tryOptic.title} />
      </Typography>

      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        style={{ marginTop: 16 }}
      >
        <Chip
          color="secondary"
          style={{
            marginLeft: 0,
            paddingLeft: 0,
            fontWeight: 800,
            marginRight: 12,
          }}
          label="5-10 min setup"
        />
        <Typography variant="body1" style={{ color: '#6d757d' }}>
          {tryOptic.description}
        </Typography>
      </Box>

      <Box style={{marginTop: 30, marginBottom: 120}}>
        <Box alignItems="center" display="flex" flexDirection="row" alignItems="flex-start" justifyContent="flex-start">
          <Button endIcon={<ForumIcon/>} component={Link} to="/docs/community/" variant="outlined" color="primary"  style={{marginRight: 13}}>Join Community</Button>
          <Button endIcon={<ChevronRightIcon/>} component={Link} to="/docs/" variant="outlined" color="primary">Get Started</Button>
        </Box>
        <GitHubStats style={{padding: 0, justifyContent: 'flex-start'}}/>
      </Box>

    </Container>
  );
}
