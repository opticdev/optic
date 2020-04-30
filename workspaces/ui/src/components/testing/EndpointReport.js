import React, { useMemo } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import { getOrUndefined, getIndex, JsonHelper } from '@useoptic/domain';
import { makeStyles } from '@material-ui/core/styles';
import { diff } from 'react-ace';
import upperFirst from 'lodash/upperFirst';

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
      <h6 className={classes.endpointPurpose}>{endpointPurpose}</h6>

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
        {requests.count > 0 && (
          <div className={classes.requestStats}>
            <h4>Requests</h4>

            <>
              {requests.regionDiffs.length > 0 && (
                <ul className={classes.diffsList}>
                  {requests.regionDiffs.map((diff) => (
                    <li key={diff.id} className={classes.diffsListItem}>
                      <NewRegionDiffDescription
                        contentType={diff.contentType}
                        statusCode={diff.statusCode}
                        count={diff.count}
                        inResponse={true}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {requests.bodyDiffs.length > 0 && (
                <ul className={classes.diffsList}>
                  {requests.bodyDiffs.map((diff) => (
                    <li key={diff.id} className={classes.diffsListItem}>
                      <BodyDiffDescription
                        assertion={diff.assertion}
                        changeType={diff.changeType}
                        count={diff.count}
                        contentType={diff.contentType}
                        inRequest={true}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          </div>
        )}

        {responses.count > 0 && (
          <div className={classes.requestStats}>
            <h4>Responses</h4>
            <>
              {responses.regionDiffs.length > 0 && (
                <ul className={classes.diffsList}>
                  {responses.regionDiffs.map((diff) => (
                    <li key={diff.id} className={classes.diffsListItem}>
                      <NewRegionDiffDescription
                        contentType={diff.contentType}
                        statusCode={diff.statusCode}
                        count={diff.count}
                        inResponse={true}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {responses.bodyDiffs.length > 0 && (
                <ul className={classes.diffsList}>
                  {responses.bodyDiffs.map((diff) => (
                    <li key={diff.id} className={classes.diffsListItem}>
                      <BodyDiffDescription
                        assertion={diff.assertion}
                        changeType={diff.changeType}
                        count={diff.count}
                        contentType={diff.contentType}
                        statusCode={diff.statusCode}
                        inResponse={true}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          </div>
        )}
      </div>
    );
  }
}

function NewRegionDiffDescription({
  contentType,
  count,
  statusCode,
  inRequest,
  inResponse,
}) {
  const classes = useStyles();

  return (
    <div className={classes.diffContainer}>
      <div className={classes.diffDescription}>
        {inRequest && (
          <>
            Undocumented Request type (<code>{contentType}</code>)
          </>
        )}

        {inResponse && (
          <>
            Undocumented <code>{statusCode}</code> Response type (
            <code>{contentType}</code>)
          </>
        )}
      </div>
      <small className={classes.diffMeta}>
        {inResponse
          ? 'new combination of status code and content type'
          : 'new content type'}{' '}
        observed <strong>{count > 1 ? `${count} times` : 'once'}</strong>
      </small>
    </div>
  );
}

function BodyDiffDescription({
  assertion,
  changeType,
  contentType,
  count,
  statusCode,
  inRequest,
  inResponse,
}) {
  const classes = useStyles();

  return (
    <div className={classes.diffContainer}>
      <div className={classes.diffDescription}>
        {inRequest && (
          <>
            {upperFirst(assertion)} in Request body (<code>{contentType}</code>)
          </>
        )}

        {inResponse && (
          <>
            {upperFirst(assertion)} in <code>{statusCode}</code> Response body (
            <code>{contentType}</code>)
          </>
        )}
      </div>
      <small className={classes.diffMeta}>
        difference with documentated shape observed{' '}
        <strong>{count > 1 ? `${count} times` : 'once'}</strong>
      </small>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 2, 3),
  },

  endpointPurpose: {
    ...theme.typography.h6,
    margin: 0,
  },

  diffsContainer: {},

  diffsList: {
    padding: 0,
    listStyleType: 'none',
  },

  diffsListItem: {
    marginBottom: theme.spacing(3),
  },
}));

function createEndpointsDiffSummary(diffRegions) {
  const { bodyDiffs, newRegions } = diffRegions;

  const responseNewRegions = newRegions.filter(getInResponse);
  const responseBodyDiffs = bodyDiffs.filter(getInResponse);
  const requestNewRegions = newRegions.filter(getInRequest);
  const requestBodyDiffs = bodyDiffs.filter(getInResponse);

  const requests = {
    regionDiffs: requestNewRegions.map(createRegionDiff),
    bodyDiffs: requestBodyDiffs.map(createShapeDiff),
    unmatchedContentTypes: requestNewRegions
      .filter(getContentType)
      .map(getContentType),
  };

  const responses = {
    regionDiffs: responseNewRegions.map(createRegionDiff),
    bodyDiffs: responseBodyDiffs.map(createShapeDiff),
    unmatchedStatusCodes: responseNewRegions
      .filter(getStatusCode)
      .map(getStatusCode),
    unmatchedContentTypes: responseNewRegions
      .filter(getContentType)
      .map(getContentType),
  };

  return {
    totalCount: bodyDiffs.length + newRegions.length,
    responses: {
      ...responses,
      count: responses.regionDiffs.length + responses.bodyDiffs.length,
    },
    requests: {
      ...requests,
      count: requests.regionDiffs.length + requests.bodyDiffs.length,
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
  function createShapeDiff(diff) {
    const interaction = getIndex(diff.interactions)(0);
    const body = diff.inRequest
      ? interaction.request.body
      : interaction.response.body;

    console.log(JsonHelper.seqToJsArray(diff.location));

    return {
      id: diff.toString(),
      assertion: diff.description.assertion,
      contentType: getOrUndefined(body.contentType),
      count: 1, // replace with actual count
      location: JsonHelper.seqToJsArray(diff.location),
      changeType: diff.description.changeTypeAsString,
      summary: diff.description.summary,
      statusCode: diff.inResponse ? interaction.response.statusCode : null,
    };
  }

  function createRegionDiff(diff) {
    return {
      id: diff.toString(),
      count: 1, // replace with actual count
      contentType: getOrUndefined(diff.contentType),
      statusCode: getOrUndefined(diff.statusCode),
      changeType: diff.description.changeTypeAsString,
      summary: diff.description.summary || diff.description.assertion,
    };
  }
}
