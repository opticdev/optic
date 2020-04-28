import React, { useMemo } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import { mapScala, JsonHelper } from '@useoptic/domain';
import { makeStyles } from '@material-ui/core/styles';

export default function EndpointReportContainer(props) {
  const { captureId, endpoint } = props;
  const { error, loading, result: diffRegions } = useTestingService((service) =>
    service.loadEndpointDiffs(captureId, endpoint.pathId, endpoint.method)
  );

  const diffsSummary = useMemo(() => {
    if (!diffRegions) return null;
    return createEndpointsDiffSummary(diffRegions);
  });

  if (error) throw error;

  return (
    <EndpointReport
      endpointCounts={endpoint.counts}
      endpointPurpose={endpoint.descriptor.endpointPurpose}
      loadingDiffsSummary={loading}
      diffsSummary={diffsSummary}
    />
  );
}

export function EndpointReport(props) {
  const { diffsSummary, endpointPurpose, endpointCounts } = props;

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <p>
        TODO: add stats about this endpoint specifically, like number of
        interactions, example response, diffs, etc.
      </p>
      <p>{endpointPurpose}</p>
      <ul>
        <li>
          Amount of <strong>observed</strong> interactions:{' '}
          {endpointCounts.interactions}
        </li>
        <li>
          Amount of <strong>compliant</strong> interactions:{' '}
          {endpointCounts.compliant}
        </li>
        <li>
          Amount of <strong>incompliant</strong> interactions:{' '}
          {endpointCounts.incompliant}
        </li>
        <li>
          Amount of <strong>diffs</strong>: {endpointCounts.diffs}
        </li>
      </ul>

      {diffsSummary && <EndpointDiffsSummary diffsSummary={diffsSummary} />}
    </div>
  );
}

function EndpointDiffsSummary({ diffsSummary }) {
  const { responses, requests } = diffsSummary;
  const classes = useStyles();

  if (diffsSummary.totalCount < 1) {
    return <div>No diffs!</div>;
  } else {
    return (
      <div className={classes.diffsContainer}>
        <div className={classes.requestStats}>
          <h4>Requests</h4>

          <ul>
            <li>
              Unmatched content types:{' '}
              {requests.unmatchedContentTypes.length < 1
                ? 'none'
                : requests.unmatchedContentTypes.join(',')}
            </li>

            <li>
              Unmatched bodies:{' '}
              {requests.bodyShapes.length < 1 ? (
                'none'
              ) : (
                <ul>
                  {requests.bodyShapes.map((diff) => (
                    <li key={diff.id}>
                      {diff.summary} <small>{diff.location.join(', ')}</small>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>

        <div className={classes.requestStats}>
          <h4>Responses</h4>

          <ul>
            <li>
              Unmatched content types:{' '}
              {responses.unmatchedContentTypes.length < 1
                ? 'none'
                : responses.unmatchedContentTypes.join(',')}
            </li>

            <li>
              Unmatched status codes:{' '}
              {responses.unmatchedStatusCodes.length < 1
                ? 'none'
                : responses.unmatchedStatusCodes.join(',')}
            </li>

            <li>
              Unmatched bodies:
              {responses.bodyShapes.length < 1 ? (
                'none'
              ) : (
                <ul>
                  {responses.bodyShapes.map((diff) => (
                    <li key={diff.id}>
                      {diff.summary} <small>{diff.location.join(', ')}</small>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          </ul>
        </div>
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

function createEndpointsDiffSummary(diffRegions) {
  const { bodyDiffs, newRegions } = diffRegions;

  const responseNewRegions = newRegions.filter(getInResponse);
  const responseBodyDiffs = bodyDiffs.filter(getInResponse);
  const requestNewRegions = newRegions.filter(getInRequest);
  const requestBodyDiffs = newRegions.filter(getInResponse);

  const requests = {
    unmatchedContentTypes: requestNewRegions
      .filter(getContentType)
      .map(getContentType),
    bodyShapes: requestNewRegions.map(createBodyShapeDiff),
  };

  const responses = {
    unmatchedStatusCodes: responseNewRegions
      .filter(getStatusCode)
      .map(getStatusCode),
    unmatchedContentTypes: responseNewRegions
      .filter(getContentType)
      .map(getContentType),
    bodyShapes: responseBodyDiffs.map(createBodyShapeDiff),
  };

  return {
    totalCount: bodyDiffs.length + newRegions.length,
    responses: {
      ...responses,
      count:
        responses.unmatchedStatusCodes.length +
        responses.unmatchedContentTypes.length +
        responses.bodyShapes.length,
    },
    requests: {
      ...requests,
      count: requests.unmatchedContentTypes.length + requests.bodyShapes.length,
    },
  };

  function getInRequest(diff) {
    return diff.inRequest;
  }
  function getInResponse(diff) {
    return diff.inResponse;
  }
  function getStatusCode(diff) {
    return diff.statusCode;
  }
  function getContentType(diff) {
    return diff.contentType;
  }
  function createBodyShapeDiff(diff) {
    return {
      id: diff.toString(),
      location: JsonHelper.seqToJsArray(diff.location),
      changeType: diff.description.changeTypeAsString,
      summary: diff.description.summary,
    };
  }
}
