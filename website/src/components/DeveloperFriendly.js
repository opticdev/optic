import { useFeatureStyles } from './featureStyles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormatCopy } from './FormatCopy';
import React from 'react';
import { useStyles } from './CommandDemo';
import Grid from '@material-ui/core/Grid';
import { DemoStartCommandSetup } from './SetupType';
import { Code } from './CodeBlock';
import {primary} from './theme';

const copy = {
  "headline": "**Developer-Friendly** workflows",
  "description": "Optic is a Git-like tool that uses development traffic to version the behavior of your APIs. Changes to existing endpoints produce diffs while new endpoints can be documented and added to your specification in seconds. Get the benefits of OpenAPI, without learning the spec or writing YAML.",
  "alias": "Just install the API CLI and setup aliases for the commands you use most during development. Start using the aliases when you develop so Optic can observe/diff traffic.",
  "status": "Use api status to review API diffs, and update the specification.",
  "closing": "Optic adds an API changelog to every PR so proposed changes can be reviewed by your team, before getting deployed."
}

const langs = [
  'node-js-logo.svg',
  'rails.svg',
  'python-5.svg',
  'docker.png',
  'kubernets.svg',
  'go-6.svg',
  'java-4.svg',
  'c--4.svg',
  'scala-4.svg',
  'php-1.svg',
  'rust.svg',
  'aws-2.svg',
  'google-cloud-1.svg',
  'kong.svg',
  'azure-1.svg',
];

export function DeveloperFriendly() {
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
          <FormatCopy value={copy.headline} />
        </Typography>
        <Typography
          variant="subtitle2"
          className={featuredStyles.descriptions}
          style={{ marginBottom: 12 }}
        >
          {copy.description}
        </Typography>
        <Typography variant="subtitle2" className={featuredStyles.descriptions}>
          Runs fast in any dev stack (thanks for the boost Rust community!):
          <div style={{ paddingTop: 5 }}>
            {langs.map((i) => {
              return (
                <img
                  src={'../../static/img/langs/' + i}
                  height={17}
                  style={{ marginRight: 10, marginLeft: 4 }}
                />
              );
            })}
          </div>
        </Typography>
        <Grid container>
          <Grid item xs={12} sm={12} md={6}>
            <img src={'../../static/img/alias.png'} width="100%" />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContents: 'center',
            }}
          >
            <div
              className={classes.gitBotBenefits}
              style={{ alignItems: 'flex-start' }}
            >
              <DemoStartCommandSetup />
              <Typography
                variant="subtitle2"
                className={featuredStyles.descriptions}
                style={{ marginBottom: 0 }}
              >
                {copy.alias}
              </Typography>
            </div>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} sm={12} md={6}>
            <img
              src={'../../static/img/api-status.png'}
              width="100%"
            />
          </Grid>
          <Grid
            item
            xs={12}
            sm={12}
            md={6}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContents: 'center',
            }}
          >
            <div
              className={classes.gitBotBenefits}
              style={{ alignItems: 'flex-start' }}
            >
              <Typography
                variant="subtitle2"
                className={featuredStyles.descriptions}
                style={{ marginBottom: 0 }}
              >
                Use{' '}
                <Code>
                  <span
                    style={{ color: primary, fontWeight: 800, fontSize: 19 }}
                  >
                    api status
                  </span>
                </Code>{' '}
                to review API diffs:
                <ul>
                  <li>Document new endpoints in seconds</li>
                  <li>
                    Propose API changes to your team without learning OpenAPI.{' '}
                  </li>
                </ul>
              </Typography>
            </div>
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
}
