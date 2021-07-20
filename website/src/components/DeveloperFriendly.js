import { useFeatureStyles } from './featureStyles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormatCopy } from './FormatCopy';
import React from 'react';
import { useStyles } from './CommandDemo';
import Grid from '@material-ui/core/Grid';
import { DemoStartCommandSetup } from './SetupType';
import { Code } from './CodeBlock';
import { primary } from './theme';
import { Paper } from '@material-ui/core';

const copy = {
  headline: '**API-First** with Optic',
  description:
    'Use Optic as the source-of-truth for your API. Document any API in minutes, have a conversation with your team whenever the API changes.',
};

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
    <div>
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
    </div>
  );
}
