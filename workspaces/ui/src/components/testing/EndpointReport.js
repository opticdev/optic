import React from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import { makeStyles } from '@material-ui/core/styles';

export default function EndpointReport(props) {
  const { captureId, endpoint } = props;
  const { error, loading, result: diffRegions } = useTestingService((service) =>
    service.loadEndpointDiffs(captureId, endpoint.pathId, endpoint.method)
  );

  if (error) throw error;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <p>
        TODO: add stats about this endpoint specifically, like number of
        interactions, example response, diffs, etc.
      </p>
      <p>{endpoint.descriptor.endpointPurpose}</p>
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

      {diffRegions && <EndpointDiffsSummary diffRegions={diffRegions} />}
    </div>
  );
}

function EndpointDiffsSummary({ diffRegions }) {
  const { newRegions, bodyDiffs } = diffRegions;
  const allDiffs = [...newRegions, ...bodyDiffs];

  if (allDiffs.length < 1) {
    return <div>No diffs!</div>;
  } else {
    return (
      <ul>
        {allDiffs.map((diff) => (
          <li key={diff.toString()}>{diff.description.summary}</li>
        ))}
      </ul>
    );
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 2, 3),
  },
}));
