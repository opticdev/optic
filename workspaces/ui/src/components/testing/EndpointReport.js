import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

export default function EndpointReport(props) {
  const { endpoint } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <p>
        TODO: add stats about this endpoint specifically, like number of
        interactions, example response, diffs, etc.
      </p>
      <ul>
        <li>
          Amount of <strong>observed</strong> interactions:{' '}
          {endpoint.counts.interactions}
        </li>
        <li>
          Amount of <strong>compliant</strong> interactions:{' '}
          {endpoint.counts.compliant}
        </li>
        <li>
          Amount of <strong>incompliant</strong> interactions:{' '}
          {endpoint.counts.incompliant}
        </li>
        <li>
          Amount of <strong>diffs</strong>: {endpoint.counts.diffs}
        </li>
      </ul>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 2, 3),
  },
}));
