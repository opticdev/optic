import { useFeatureStyles } from './featureStyles';
import Typography from '@material-ui/core/Typography';
import { FormatCopy } from './FormatCopy';
import React from 'react';
import { Container } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Link from '@docusaurus/core/lib/client/exports/Link';
import { Code } from './CodeBlock';
import makeStyles from '@material-ui/styles/makeStyles';
import { SubtleBlueBackground, UpdatedBlueBackground } from './theme';
import { Skeleton } from '@material-ui/lab';

export const useStyles = makeStyles((theme) => ({
  flexBox: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 18,
  },
}));

function FeatureCard(props) {
  const { title, description, linkText, linkUrl, image } = props;
  const classes = useStyles();
  const featuredClasses = useFeatureStyles();
  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          height: 228,
          // backgroundColor: UpdatedBlueBackground,
          marginBottom: 25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <img src={image} height={'80%'} />
      </div>
      <div style={{ paddingRight: 30 }}>
        <Typography
          style={{ fontSize: 24 }}
          className={featuredClasses.headline}
        >
          {title}
        </Typography>
        <Typography
          style={{ fontSize: 18 }}
          variant="h5"
          className={featuredClasses.subtext}
        >
          {description}
        </Typography>
        <div style={{ marginTop: 10 }}>
          <Link>{linkText}</Link>
        </div>
      </div>
    </div>
  );
}

const CoverageFeature = () => (
  <FeatureCard
    title="API Test Coverage"
    description="Imagine Code-Coverage, but for APIs. Teams use coverage to understand how good their API tests are today, and provide confidence during release."
    linkText="Measure your API Test Coverage"
    image="/img/Optic_Changelog.svg"
  />
);

const ChangelogInPR = () => (
  <FeatureCard
    title="API Changelogs in Every Pull Request"
    description="What if it were easy to talk about API Changes during Code Review? Optic's GitBot adds an accurate API changelog to every Pull Request that changes the API contract. Suggest changes, discuss improvements, build a better API, together."
    linkText="Pick an Optic Workflows"
    image="/img/Optic_revert_done.svg"
  />
);

const APIChecks = () => (
  <FeatureCard
    title="Design Consistent APIs"
    description="Optic built an approach to linting API Contracts that runs right in CI, and only gives you feedback about changes you're about to make, not the old endpoints you'll never go back and fix. It's simple, and makes it easy to desing great APIs together."
    linkText="Start using API Checks"
    image="/img/Optic_api_checks.svg"
  />
);

const APITesting = () => (
  <FeatureCard
    title="Fail your Tests when the API Changes"
    description="When your existing tests are run with Optic, you gain the ability to fail the test suite when the API contract is not met. With Optic it is easy to verify your API contract without rewriting the tests you already have."
    linkText="Testing your API with Optic"
    image="/img/Optic_learn_endpoint.svg"
  />
);

export function GridSupport() {
  const featuredClasses = useFeatureStyles();
  const classes = useStyles();

  return (
    <div style={{ backgroundColor: SubtleBlueBackground }}>
      <Container maxWidth="lg" style={{ paddingTop: 70, paddingBottom: 90 }}>
        <div style={{ paddingLeft: 20 }}>
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
              The New API Toolchain
            </Typography>
          </div>
          <Typography variant="h1" className={featuredClasses.headline}>
            API-First Workflows, built for Developers, without YAML
          </Typography>
        </div>

        <Grid item container xs={12} style={{ marginTop: 20 }}>
          <Grid item xs={12} sm={6}>
            <CoverageFeature />
          </Grid>
          <Grid item xs={12} sm={6}>
            <ChangelogInPR />
          </Grid>
          <Grid item xs={12} sm={6}>
            <APIChecks />
          </Grid>
          <Grid item xs={12} sm={6}>
            <APITesting />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
