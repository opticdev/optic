import React from 'react';
import { MuiThemeProvider } from './Roadmap';
import Layout from '@theme/Layout';
import { Container, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { SubtleBlueBackground } from '../components/theme';
import { DocumentUseCaseCard, UseCaseCard } from '../components/UseCaseCard';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import BrowserOnly from '@docusaurus/core/lib/client/exports/BrowserOnly';

const workflows = require('../../workflows');
const usecases = require('../../use-cases');

const useStyles = makeStyles((theme) => ({
  root: {
    height: 250,
    backgroundColor: SubtleBlueBackground,
    borderBottom: '1px solid #e2e2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  section: {
    marginTop: 50,
    marginBottom: 100,
  },
  heading: {
    fontFamily: 'Ubuntu Mono',
    fontWeight: 700,
    fontSize: 25,
  },
}));

export default function () {
  const classes = useStyles();
  return (
    <Layout title="Docs">
      <BrowserOnly
        children={() => {
          return (
            <MuiThemeProvider>
              <Container
                maxWidth={false}
                fullWidth={true}
                className={classes.root}
              >
                <div style={{ maxWidth: 700, padding: 10 }}>
                  <Typography variant="h1" className={classes.heading}>
                    Optic uses real traffic to document and test your API
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    style={{ lineHeight: 1.6, marginTop: 10 }}
                  >
                    Make sure every API change is documented, reviewed, and
                    approved before it gets deployed. We build open source tools
                    and workflows that make using API specifications
                    developer-friendly.
                  </Typography>
                </div>
              </Container>

              <Container
                maxWidth={'md'}
                fullWidth={true}
                className={classes.section}
              >
                <Typography
                  variant="h5"
                  className={classes.heading}
                  style={{ textAlign: 'center', fontSize: 30 }}
                >
                  Use Cases
                </Typography>

                <Divider style={{ marginTop: 20, marginBottom: 30 }} />

                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <UseCaseCard
                      link={usecases.Document.href}
                      title={'**Document** your API in 10 minutes'}
                      description={
                        'Use real traffic to document your API. Optic accurately learns the behavior of each endpoint and starts versioning it, just like Git versions files you track with it.'
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <UseCaseCard
                      link={usecases.Test.href}
                      title={
                        '**Tests** that verify each API meets its contract'
                      }
                      description={
                        "Monitor your test, development and staging environments to make sure your API meets its contract. With Optic's API Coverage and Diff Reports you can confidently release new code."
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <UseCaseCard
                      link={usecases.Share.href}
                      title={'**Share** your API'}
                      description={
                        'Share your API documentation, an auto-generated changelog, and examples with all of your sumers. Optic makes it easy to update these resources whenever the API changes.'
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <UseCaseCard
                      link={usecases.Change.href}
                      title={'**Change** your API, with confidence'}
                      description={
                        'Optic provides an accurate API changelog in each PR. Start working API-first, have a conversation every time the API is changing'
                      }
                    />
                  </Grid>
                </Grid>
              </Container>

              <Container
                maxWidth={'md'}
                fullWidth={true}
                className={classes.section}
              >
                <Typography
                  variant="h5"
                  className={classes.heading}
                  style={{ textAlign: 'center', fontSize: 30 }}
                >
                  Workflows
                </Typography>

                <Divider style={{ marginTop: 20, marginBottom: 30 }} />

                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <UseCaseCard
                      link={workflows.CIGitBot.href}
                      title={workflows.CIGitBot.label}
                      description={
                        'Monitor your test, development and staging environments.API Coverage + Diff Reports help you confidently release new code.'
                      }
                    />
                  </Grid>
                  {/*<Grid item xs={12} sm={6}>*/}
                  {/*  <UseCaseCard*/}
                  {/*    link={workflows.DevelopWithOpticLocally.href}*/}
                  {/*    title={workflows.DevelopWithOpticLocally.label}*/}
                  {/*    description={*/}
                  {/*      'Share your API documentation, an auto-generated changelog, and examples with all of your consumers. Optic makes it easy to update these resources whenever the API changes.'*/}
                  {/*    }*/}
                  {/*  />*/}
                  {/*</Grid>*/}
                  <Grid item xs={6}>
                    <UseCaseCard
                      link={workflows.TeamDesignFirst.href}
                      title={workflows.TeamDesignFirst.label}
                      description={
                        'Optic provides an accurate API changelog in each PR. Start working API-first, have a conversation every time the API is changing'
                      }
                    />
                  </Grid>
                </Grid>
              </Container>
            </MuiThemeProvider>
          );
        }}
      />
    </Layout>
  );
}
