import React, { useMemo } from 'react';
import { useTestingService } from '../../contexts/TestingDashboardContext';
import { getOrUndefined, getIndex, JsonHelper } from '@useoptic/domain';
import { makeStyles } from '@material-ui/core/styles';
import { diff } from 'react-ace';
import Color from 'color';
import ClassNames from 'classnames';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import WarningIcon from '@material-ui/icons/Warning';
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
          <div className={ClassNames(classes.diffs, classes.requestDiffs)}>
            <h4 className={classes.diffsLocationHeader}>Requests</h4>

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
                        path={diff.path}
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
          <div className={ClassNames(classes.diffs, classes.responseDiffs)}>
            <h4 className={classes.diffsLocationHeader}>Responses</h4>
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
                        path={diff.path}
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
  inRequest,
  inResponse,
  path,
  statusCode,
}) {
  const classes = useStyles();

  return (
    <div className={classes.diffContainer}>
      <div className={classes.diffDescription}>
        {inRequest && (
          <>
            Shape mismatch in Request body (<code>{contentType}</code>)
          </>
        )}

        {inResponse && (
          <>
            Shape mismatch in <code>{statusCode}</code> Response body (
            <code>{contentType}</code>):
          </>
        )}
      </div>

      <small className={classes.diffMeta}>
        difference with documentated shape observed{' '}
        <strong>{count > 1 ? `${count} times` : 'once'}</strong>
      </small>

      <div className={classes.diffFieldTrail}>
        <div className={classes.diffFieldTrailRoot}>
          <code>
            {statusCode} {inResponse ? 'Response' : 'Request'} Body
          </code>
        </div>

        <ul className={classes.diffFieldTrailComponents}>
          {path.map((pathComponent, i, components) => (
            <li className={classes.diffFieldTrailComponent} key={pathComponent}>
              <ChevronRightIcon className={classes.diffFieldTrailSeparator} />
              <code>{pathComponent}</code>

              {i === components.length - 1 && (
                <div className={classes.diffFieldTrailAssertion}>
                  <WarningIcon className={classes.diffFielTrailWarningIcon} />
                  {assertion}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 2),
  },

  endpointPurpose: {
    ...theme.typography.h6,
    margin: 0,
  },

  diffsContainer: {},

  diffs: {
    marginBottom: theme.spacing(4),
  },

  diffsLocationHeader: {
    ...theme.typography.overline,
    margin: theme.spacing(2, 0, 3),
    color: Color(theme.palette.primary.main)
      .desaturate(0.55)
      .lighten(1.2)
      .hex(),
    borderBottom: `1px solid ${Color(theme.palette.primary.main)
      .desaturate(0.55)
      .lighten(1.9)
      .hex()}`,
  },

  diffsList: {
    padding: 0,
    listStyleType: 'none',
  },

  diffsListItem: {
    marginBottom: theme.spacing(4),
  },

  diffDescription: {
    fontSize: theme.typography.pxToRem(theme.typography.fontSize + 1),

    '& code': {
      color: theme.palette.primary.main,
    },
  },

  diffMeta: {
    ...theme.typography.subtitle2,
    color: theme.palette.grey[600],
    fontWeight: theme.typography.fontWeightLight,
    fontSize: theme.typography.pxToRem(12),
  },

  diffFieldTrail: {
    padding: theme.spacing(1.5, 2, 0, 1.5),
    marginLeft: 2,
    borderLeft: `8px solid ${theme.palette.grey[50]}`,
    display: 'flex',
    alignItems: 'flex-start',
    alignContent: 'baseline',
    fontSize: theme.typography.pxToRem(theme.typography.fontSize - 1),
  },

  diffFieldTrailRoot: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,

    alignItems: 'center',

    '& code': {
      padding: theme.spacing(0.5, 1),
      color: theme.palette.primary.light,
      background: theme.palette.grey[100],
    },
  },

  diffFieldTrailComponents: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    flexWrap: 'wrap',

    listStyleType: 'none',
  },

  diffFieldTrailComponent: {
    display: 'flex',
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: theme.spacing(1),

    alignItems: 'center',

    '& code': {
      padding: theme.spacing(0.5, 1),
      color: theme.palette.primary.light,
      background: theme.palette.grey[100],
    },

    '&:last-child code': {
      background: Color(theme.palette.error.light).lighten(0.3).hex(),
      color: Color(theme.palette.error.dark).darken(0.5).hex(),
    },
  },

  diffFieldTrailAssertion: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 1),

    color: Color(theme.palette.error.dark).darken(0.2).hex(),
  },

  diffFielTrailWarningIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
    color: Color(theme.palette.removed.main).darken(0.3).hex(),
  },

  diffFieldTrailSeparator: {
    width: theme.typography.pxToRem(theme.typography.fontSize + 2),
    color: theme.palette.grey[400],
  },
}));

function createEndpointsDiffSummary(diffRegions) {
  const { bodyDiffs, newRegions } = diffRegions;

  const responseNewRegions = newRegions.filter(getInResponse);
  const responseBodyDiffs = bodyDiffs.filter(getInResponse);
  const requestNewRegions = newRegions.filter(getInRequest);
  const requestBodyDiffs = bodyDiffs.filter(getInRequest);

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

    return {
      id: diff.toString(),
      assertion: diff.description.assertion,
      contentType: getOrUndefined(body.contentType),
      count: 1, // replace with actual count
      changeType: diff.description.changeTypeAsString,
      path: JsonHelper.seqToJsArray(diff.description.path),
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
