import React, { useEffect, useState } from 'react';
import { CenteredColumn } from '../../layouts/CenteredColumn';
import { makeStyles } from '@material-ui/styles';

import {
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from '@material-ui/core';
import { LoadingReview } from '../../diffs/LoadingPage';
import { OpticBlue } from '../../theme';

export function DiffEnvsPage() {
  const [status, setStatus] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setStatus(20);
    }, 100);
    setTimeout(() => {
      setStatus(40);
    }, 400);
    setTimeout(() => {
      setStatus(100);
    }, 900);
  }, []);

  const cursor = status;
  const total = 100;

  return (
    <CenteredColumn maxWidth="md" style={{ paddingTop: 50, paddingBottom: 50 }}>
      <Paper elevation={1}>
        <List dense>
          <ListItem style={{ height: 100 }}>
            <ListItemText
              primaryTypographyProps={{ variant: 'h6' }}
              primary="Local Capture"
              secondary={`${100} interactions captured since last commit`}
            />
          </ListItem>
          <ListItemSecondaryAction>
            <LoadingReview cursor={cursor} total={total} reviewLink={''} />
          </ListItemSecondaryAction>
        </List>
      </Paper>

      <Divider style={{ marginTop: 200, marginBottom: 20 }} />

      <Typography variant="h6" style={{ fontSize: 18 }}>
        Real Environments [Beta]
      </Typography>

      <Typography variant="body2">
        Optic can securely monitor your API in real environments. Once deployed,
        Optic verifies your API meets its contract, alert you when it behaves
        unexpectedly, and help you understand what parts of your API each
        consumer relies upon.
      </Typography>

      <Grid container spacing={3} style={{ marginTop: 5 }}>
        <Grid xs={4} item style={{ opacity: 0.4 }}>
          <RealEnvColumn
            name={'development'}
            examples={[
              { buildN: 19, diffs: '1 diff', requests: '1.1k' },
              { buildN: 18, diffs: '4 diffs', requests: '6.1k' },
            ]}
          />
        </Grid>
        <Grid xs={4} item style={{ opacity: 0.4 }}>
          <RealEnvColumn
            name={'staging'}
            examples={[
              { buildN: 13, diffs: '3 diffs', requests: '12.2k' },
              { buildN: 12, diffs: '12 diffs', requests: '7.2k' },
            ]}
          />
        </Grid>
        <Grid
          xs={4}
          item
          alignContent="center"
          justifyContent="center"
          display="flex"
          flexDirection="column"
          component={Box}
        >
          <Typography
            variant="body2"
            style={{
              fontFamily: 'Ubuntu Mono',
              marginBottom: 5,
              marginTop: -15,
            }}
          >
            Ready to put Optic into a real environment?
          </Typography>
          <Button color="secondary" variant="contained">
            Join Beta
          </Button>
        </Grid>
      </Grid>
    </CenteredColumn>
  );
}

export function RealEnvColumn({
  name,
  examples,
}: {
  name: string;
  examples: LiveRowProps[];
}) {
  return (
    <Paper elevation={1} square={false} style={{ overflow: 'hidden' }}>
      <Typography
        variant="body1"
        style={{
          fontFamily: 'Ubuntu Mono',
          color: '#e2e2e2',
          fontSize: 20,
          paddingLeft: 10,
          backgroundColor: OpticBlue,
        }}
      >
        {name}
      </Typography>
      <List dense>
        {examples.map((i, index) => {
          return <ExampleLiveRow key={index} {...i} />;
        })}
      </List>
    </Paper>
  );
}

type LiveRowProps = {
  buildN: number;
  requests: string;
  diffs: string;
};

function ExampleLiveRow({ buildN, requests, diffs }: LiveRowProps) {
  return (
    <ListItem dense>
      <ListItemText
        primaryTypographyProps={{ variant: 'subtitle2' }}
        primary={`build #${buildN}`}
        secondary={`${requests} observed requests. ${diffs}`}
      />
    </ListItem>
  );
}

const useStyles = makeStyles((theme) => ({
  scroll: {
    overflow: 'scroll',
  },
  locationHeader: {
    fontSize: 10,
    height: 33,
  },
  centered: {
    padding: 10,
  },
}));
