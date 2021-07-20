import { useFeatureStyles } from './featureStyles';
import Typography from '@material-ui/core/Typography';
import { FormatCopy } from './FormatCopy';
import React from 'react';
import { Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Link from '@docusaurus/core/lib/client/exports/Link';
import { Code } from './CodeBlock';
import makeStyles from '@material-ui/styles/makeStyles';

const allFrameworks = require('../../generate/results/frameworks');

const allInfrastructure = [
  'Cloudflare',
  'Azure Application Gateway',
  'Envoy',
  'Istio',
  'NGINX',
  'Kubernetes',
  'AWS API Gateway',
  'AWS Lambda',
];

const codeHosts = ['GitHub', 'GitLab', 'BitBucket'];

export const useStyles = makeStyles((theme) => ({
  flexBox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 18,
  },
}));

export function ToolsSupported() {
  const featuredClasses = useFeatureStyles();
  const classes = useStyles();

  return (
    <Container maxWidth="lg" style={{ paddingTop: 70, paddingBottom: 90 }}>
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
              Works Everywhere
            </Typography>
          </div>
          <Typography variant="h1" className={featuredClasses.headline}>
            Works with your code, infrastructure, and tools
          </Typography>
        </Grid>
      </Grid>

      <Grid item container xs={12} style={{ marginTop: 20 }}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">All your API Frameworks</Typography>
          <div className={classes.flexBox}>
            {allFrameworks.data.map((i, index) => (
              <div style={{ marginRight: 8 }}>
                <Code key={index}>{i.name}</Code>
              </div>
            ))}
          </div>
          <Link href="/roadmap" style={{ marginTop: 20 }}>
            Looking for your framework? Request it here
          </Link>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h6">Deployed Environments</Typography>
          <div className={classes.flexBox}>
            {allInfrastructure.map((i, index) => (
              <div style={{ marginRight: 8 }}>
                <Code key={index}>{i}</Code>
              </div>
            ))}
          </div>
          <Link href="/roadmap" style={{ marginTop: 20 }}>
            Looking for your infrastructure tool? Request it here
          </Link>
        </Grid>
      </Grid>
    </Container>
  );
}
