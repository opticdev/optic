import React, { useMemo } from 'react';
import Page from '../Page';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Typography } from '@material-ui/core';
import { DocDarkGrey, DocDivider } from '../docs/DocConstants';
import sortby from 'lodash.sortby';
import Button from '@material-ui/core/Button';
import DescriptionIcon from '@material-ui/icons/Description';
import ChangeHistoryIcon from '@material-ui/icons/ChangeHistory';
import { RenderTask } from './RenderTask';
const dummy = {
  name: 'Todo API',
  tasks: {
    start: {
      command: 'npm run server-start',
      inboundUrl: 'http://localhost:3005',
    },
    'go-up': {
      command:
        'go up npm run server-start npm run server-start npm run server-start',
      inboundUrl: 'http://localhost:3005',
    },
    'start-ui': {
      command: 'npm start',
      useTask: 'start',
    },
    test: {
      command: 'mocha test1.js',
      useTask: 'start',
    },
    'test-gets': {
      command: 'mocha test2.js',
      useTask: 'start',
    },
  },
  ignoreRequests: ['OPTIONS (.*)'],
};

export function ApiPage(props) {
  const classes = useStyles();

  const config = dummy;

  const tasksAsArray = Object.entries(config.tasks).map(
    ([name, definition]) => {
      return { ...definition, name };
    }
  );

  const sortedTasksAsArray = sortby(
    tasksAsArray,
    (i) => !i.name.startsWith('start')
  );

  return (
    <Page title="Your API">
      <Page.Navbar mini={true} />
      <Page.Body padded={true}>
        <div className={classes.root}>
          <Grid container>
            <Grid item sm={7} style={{ paddingRight: 14 }}>
              <Typography variant="h4">{config.name}</Typography>
              <Typography
                variant="caption"
                style={{ color: DocDarkGrey, paddingLeft: 5 }}
              >
                0 endpoints, last updated 43 minutes ago
              </Typography>
              <div style={{ marginTop: 5 }}>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<DescriptionIcon />}
                >
                  Documentation
                </Button>
                <Button
                  size="small"
                  color="primary"
                  startIcon={<ChangeHistoryIcon />}
                >
                  Review Diffs
                </Button>
              </div>
              <DocDivider style={{ marginTop: 8, marginBottom: 15 }} />
              <Typography
                variant="subtitle2"
                style={{ marginBottom: 6, color: DocDarkGrey }}
              >
                Start Commands:
              </Typography>
              {sortedTasksAsArray
                .filter((i) => !i.useTask)
                .map((i) => (
                  <RenderTask {...i} />
                ))}

              <Typography
                variant="subtitle2"
                style={{ marginTop: 22, marginBottom: 6, color: DocDarkGrey }}
              >
                Test Commands:
              </Typography>
              {sortedTasksAsArray
                .filter((i) => !i.useTask)
                .map((i) => (
                  <RenderTask {...i} />
                ))}
            </Grid>
            <Grid
              item
              sm={5}
              style={{ borderLeft: '1px solid #e2e2e2', paddingLeft: 14 }}
            >
              Right
            </Grid>
          </Grid>
        </div>
      </Page.Body>
    </Page>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: 18,
    margin: '0 auto',
    maxWidth: 920,
    width: '100%',
  },
}));
