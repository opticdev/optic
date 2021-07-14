import React from 'react';
import makeStyles from '@material-ui/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import { useFeatureStyles } from './featureStyles';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { Paper } from '@material-ui/core';
import {
  OpticBlue,
  OpticBlueLightened,
  OpticBlueReadable,
} from '@useoptic/ui-v2/src/constants/theme';
import {
  SubtleBlueBackground,
  UpdatedBlue,
  UpdatedBlueBackground,
} from './theme';
import Button from '@material-ui/core/Button';
import Link from '@docusaurus/core/lib/client/exports/Link';
import { links } from './links';

export const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: 70,
    marginBottom: 120,
  },
  detail: {
    marginTop: 30,
  },
  rightBullets: {
    // backgroundColor: SubtleBlueBackground,
    // borderRadius: 8,
    // border: '1px solid',
    // borderColor: UpdatedBlueBackground,
    [theme.breakpoints.up('md')]: {
      marginRight: 25,
      marginTop: 10,
    },
  },
}));

export function DocumentValueProp() {
  const props = {
    mini: 'Document',
    heading: 'Document your API, know when it changes',
    description: `Optic gives developers a simple workflow for maintaining an accurate, up-to-date API Contract. The tool makes it easy to document new endpoints, detect unplanned changes to the API behavior, and update the API Contract when planned API changes have been released.
`,
    image: '/img/Optic_Graphic1.svg',
    bullets: [
      'Document endpoints in seconds',
      'Update docs when the API changes',
      'Share with API changelogs with consumers',
    ],
    link: links.DocumentAPI,
    linkText: 'Document your API in 10 minutes',
  };

  return <ValuePropRegion {...props} />;
}
export function ChangeValueProp() {
  const props = {
    mini: 'Change',
    heading: 'Discuss API Changes during Code Review',
    description:
      'Optic adds an API Changelog to every Open Pull Request. Now your team can talk about both "API Changes" and "File Changes" during code review.',
    image: '/img/Optic_Graphic3.svg',
    bullets: [
      'Document new endpoints in seconds',
      'Review every API Change',
      'Share changelogs with consumers',
    ],
    link: links.Change,
    linkText: 'Add Optic to your API Workflow',
  };

  return <ValuePropRegion {...props} />;
}

export function TestValueProp() {
  const props = {
    mini: 'Test',
    heading: 'Test your API with Optic',
    description:
      'Use traffic from your Tests and from Staging environments to verify each version of your API meets its contract, before it gets deployed to users. Get the  benefits of Contract Tests, without writing and maintaining them.',
    image: '/img/Optic_Graphic4-01.png',
    bullets: [
      'Detect API Changes Before they affect consumers ',
      'Understand your API Test Coverage',
      'Confidence your APIs work as designed',
    ],
    linkText: 'Test your API with Optic',
    link: links.Test,
  };

  return <ValuePropRegion {...props} />;
}

export function ValuePropRegion(props) {
  const { mini, heading, description, image, linkText, link } = props;

  const classes = useStyles();
  const featuredClasses = useFeatureStyles();

  return (
    <Container maxWidth="md" className={classes.container}>
      <Grid container xs={12}>
        <Grid item>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'flex-start',
            }}
          >
            <Typography
              variant="subtitle1"
              component="div"
              className={featuredClasses.mini}
            >
              {mini}
            </Typography>
          </div>
          <Typography variant="h1" className={featuredClasses.headline}>
            {heading}
          </Typography>
          <Typography variant="h1" className={featuredClasses.subtext}>
            {description} <br />
            <br /> <Link href={link}>{linkText} ➜ </Link>
          </Typography>
        </Grid>

        <Grid item container xs={12} className={classes.detail}>
          <Grid item xs={12} md={5}></Grid>
          <Grid item xs={12} md={7}>
            <img src={image} />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}
