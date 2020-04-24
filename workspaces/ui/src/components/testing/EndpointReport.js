import React, { useMemo } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import { opticEngine, mapScala, JsonHelper } from '@useoptic/domain';
import { makeStyles } from '@material-ui/core/styles';

export default function EndpointReport(props) {
  const { captureId, endpoint } = props;
  const {
    error,
    loading,
    result: interactionsByDiff,
  } = useTestingService((service) =>
    service.loadEndpointDiffs(captureId, endpoint.pathId, endpoint.method)
  );

  const endpointSummary = useMemo(() => {
    if (!interactionsByDiff) return null;
    return createEndpointSummary(interactionsByDiff);
  }, [interactionsByDiff]);

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

      {endpointSummary && (
        <EndpointDiffsSummary endpointSummary={endpointSummary} />
      )}
    </div>
  );
}

function EndpointDiffsSummary({ endpointSummary }) {
  const classes = useStyles();

  const bodyDiffs = []; // placeholder
  const newRegions = []; // placeholder

  if (endpointSummary.length < 1) {
    return <div>No diffs!</div>;
  } else {
    return (
      <div className={classes.diffsContainer}>
        {bodyDiffs.length > 0 && (
          <div className={classes.bodyRegion}>
            <h5>Diffs in Response Body</h5>

            <ul>
              {bodyDiffs.map((diff) => (
                <li key={diff.toString()}>
                  {diff.description.summary}{' '}
                  <small>
                    {mapScala(diff.location)((location) => location).join(
                      ' > '
                    )}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}

        {newRegions.length > 0 && (
          <div className={classes.newRegions}>
            <h5>New responses</h5>

            <ul>
              {newRegions.map((diff) => (
                <li key={diff.toString()}>{diff.description.summary}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2, 2, 3),
  },

  diffsContainer: {},
}));

function createEndpointSummary(interactionsByDiff) {
  const diffRegions = opticEngine.com.useoptic.diff.helpers
    .DiffResultHelpers(interactionsByDiff)
    .listRegions();

  const statusCodes = diffRegions.statusCodes;

  return {
    length: 0,
    statusCodes: JsonHelper.seqToJsArray(statusCodes),
  };
}
