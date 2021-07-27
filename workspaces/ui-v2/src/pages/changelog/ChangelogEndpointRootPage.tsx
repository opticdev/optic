import React, { FC } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import { LinearProgress, Typography, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import ReactMarkdown from 'react-markdown';

import {
  EndpointName,
  PathParameters,
  PageLayout,
  FullWidth,
  FieldOrParameter,
  ContributionFetcher,
  ShapeFetcher,
  QueryParametersPanel,
  ContributionsList,
  convertShapeToQueryParameters,
  HttpBodyPanel,
  HttpBodySelector,
  Panel,
} from '<src>/components';
import { useChangelogPages } from '<src>/components/navigation/Routes';
import { SubtleBlueBackground, FontFamily } from '<src>/styles';
import { selectors, useAppSelector } from '<src>/store';
import { getEndpointId } from '<src>/utils';
import { EndpointTOC } from '<src>/pages/docs/components';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
} from './components';

export const ChangelogEndpointRootPage: FC<
  RouteComponentProps<{
    batchId: string;
    pathId: string;
    method: string;
  }>
> = (props) => {
  return (
    <PageLayout AccessoryNavigation={ChangelogPageAccessoryNavigation}>
      <ValidateBatchId batchId={props.match.params.batchId}>
        <ChangelogRootComponent {...props} />
      </ValidateBatchId>
    </PageLayout>
  );
};

const ChangelogRootComponent: FC<
  RouteComponentProps<{
    pathId: string;
    method: string;
    batchId: string;
  }>
> = ({ match }) => {
  const { pathId, method, batchId } = match.params;
  const classes = useStyles();
  const changelogPageLink = useChangelogPages();
  const endpointsState = useAppSelector((state) => state.endpoints.results);
  const thisEndpoint = useAppSelector(
    selectors.getEndpoint({ pathId, method })
  );
  const endpointChanges = useAppSelector(
    (state) => state.endpoints.results.data?.changes || {}
  );
  const endpointWithChanges = selectors.filterRemovedItemForChangelog(
    thisEndpoint ? [thisEndpoint] : [],
    endpointChanges,
    (endpoint) => getEndpointId(endpoint)
  );
  const visibleQueryParameters =
    thisEndpoint &&
    thisEndpoint.query &&
    selectors.isItemVisibleForChangelog(
      thisEndpoint.query,
      endpointChanges,
      (query) => query.queryParametersId
    )
      ? thisEndpoint.query
      : null;
  const visibleRequests = selectors.filterRemovedItemForChangelog(
    thisEndpoint ? thisEndpoint.requests : [],
    endpointChanges,
    (request) => request.requestId
  );
  const visibleResponsesByStatusCode = selectors.filterMapOfRemovedItemsForChangelog(
    thisEndpoint ? thisEndpoint.responsesByStatusCode : {},
    endpointChanges,
    (response) => response.responseId
  );

  const isEndpointRemoved = thisEndpoint && endpointWithChanges.length === 0;
  const isEndpointRemovedInThisBatch =
    endpointWithChanges.length > 0 &&
    endpointWithChanges[0].changes === 'removed';

  if (endpointsState.loading) {
    return <LinearProgress variant="indeterminate" />;
  }
  if (endpointsState.error) {
    return <>error loading endpoint changelog information</>;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }

  if (isEndpointRemoved) {
    return <Redirect to={changelogPageLink.linkTo(batchId)} />;
  }

  const endpointId = getEndpointId(thisEndpoint);
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );

  return (
    <>
      {isEndpointRemovedInThisBatch && (
        <Alert severity="error" className={classes.removedInfoHeader}>
          This endpoint has been removed
        </Alert>
      )}
      <FullWidth style={{ paddingTop: 30, paddingBottom: 400 }}>
        <Typography className={classes.regularField}>
          {thisEndpoint.purpose || 'Unnamed Endpoint'}
        </Typography>
        <EndpointName
          fontSize={19}
          leftPad={0}
          method={thisEndpoint.method}
          fullPath={thisEndpoint.fullPath}
        />

        <div className={classes.bodyContainer}>
          <div className={classes.bodyDetails}>
            <div>
              <ReactMarkdown
                className={classes.contents}
                source={thisEndpoint.description}
              />
            </div>
            <div className={classes.panel}>
              <Panel
                header={
                  <EndpointName
                    fontSize={14}
                    leftPad={0}
                    method={thisEndpoint.method}
                    fullPath={thisEndpoint.fullPath}
                  />
                }
              >
                <PathParameters parameters={parameterizedPathParts} />
                <div
                  style={{
                    marginTop: 10,
                    backgroundColor: SubtleBlueBackground,
                    borderTop: '1px solid #e2e2e2',
                  }}
                >
                  <EndpointTOC
                    query={visibleQueryParameters}
                    requests={visibleRequests}
                    responsesByStatusCode={visibleResponsesByStatusCode}
                  />
                </div>
              </Panel>
            </div>
          </div>
        </div>

        {visibleQueryParameters && (
          <div className={classes.bodyContainer} id="query-parameters">
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Query Parameters</h6>
              <ReactMarkdown
                className={classes.contents}
                source={visibleQueryParameters.description}
              />
            </div>
            <div className={classes.bodyDetails}>
              <div>
                <ContributionFetcher
                  rootShapeId={visibleQueryParameters.rootShapeId}
                  endpointId={endpointId}
                  changesSinceBatchCommit={batchId}
                >
                  {(fields) => (
                    <ContributionsList
                      renderField={(field) => (
                        <FieldOrParameter
                          key={
                            field.contribution.id +
                            field.contribution.contributionKey
                          }
                          name={field.name}
                          shapes={field.shapes}
                          depth={field.depth}
                          value={field.contribution.value}
                        />
                      )}
                      fieldDetails={fields}
                    />
                  )}
                </ContributionFetcher>
              </div>
              <div className={classes.panel}>
                <ShapeFetcher
                  rootShapeId={visibleQueryParameters.rootShapeId}
                  changesSinceBatchCommit={batchId}
                >
                  {(shapes) => (
                    <QueryParametersPanel
                      parameters={convertShapeToQueryParameters(shapes)}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </div>
        )}

        {visibleRequests.length > 0 && (
          <div className={classes.bodyContainer} id="request-body">
            <div className={classes.bodyHeaderContainer}>
              <h6 className={classes.bodyHeader}>Request Body</h6>
            </div>

            <HttpBodySelector
              items={visibleRequests}
              getDisplayName={(request) =>
                request.body?.contentType || 'No Body'
              }
            >
              {(request) => (
                <>
                  <div className={classes.bodyContributionContainer}>
                    <ReactMarkdown
                      className={classes.contents}
                      source={request.description}
                    />
                  </div>
                  {request.body ? (
                    <div className={classes.bodyDetails}>
                      <div>
                        <ContributionFetcher
                          rootShapeId={request.body.rootShapeId}
                          endpointId={endpointId}
                          changesSinceBatchCommit={batchId}
                        >
                          {(fields) => (
                            <ContributionsList
                              renderField={(field) => (
                                <FieldOrParameter
                                  key={
                                    field.contribution.id +
                                    field.contribution.contributionKey
                                  }
                                  name={field.name}
                                  shapes={field.shapes}
                                  depth={field.depth}
                                  value={field.contribution.value}
                                />
                              )}
                              fieldDetails={fields}
                            />
                          )}
                        </ContributionFetcher>
                      </div>
                      <div className={classes.panel}>
                        <ShapeFetcher
                          rootShapeId={request.body.rootShapeId}
                          changesSinceBatchCommit={batchId}
                        >
                          {(shapes) => (
                            <HttpBodyPanel
                              shapes={shapes}
                              location={request.body!.contentType}
                            />
                          )}
                        </ShapeFetcher>
                      </div>
                    </div>
                  ) : (
                    <>No Body Request</>
                  )}
                </>
              )}
            </HttpBodySelector>
          </div>
        )}
        {selectors
          .getResponsesInSortedOrder(visibleResponsesByStatusCode)
          .map(([statusCode, responses]) => (
            <div
              className={classes.bodyContainer}
              id={statusCode}
              key={statusCode}
            >
              <div className={classes.bodyHeaderContainer}>
                <h6 className={classes.bodyHeader}>{statusCode} Response</h6>
              </div>
              <HttpBodySelector
                items={responses}
                getDisplayName={(response) =>
                  response.body?.contentType || 'No Body'
                }
              >
                {(response) => (
                  <>
                    <div className={classes.bodyContributionContainer}>
                      <ReactMarkdown
                        className={classes.contents}
                        source={response.description}
                      />
                    </div>
                    <div className={classes.bodyDetails}>
                      {response.body ? (
                        <>
                          <div>
                            <ContributionFetcher
                              rootShapeId={response.body.rootShapeId}
                              endpointId={endpointId}
                              changesSinceBatchCommit={batchId}
                            >
                              {(fields) => (
                                <ContributionsList
                                  renderField={(field) => (
                                    <FieldOrParameter
                                      key={
                                        field.contribution.id +
                                        field.contribution.contributionKey
                                      }
                                      name={field.name}
                                      shapes={field.shapes}
                                      depth={field.depth}
                                      value={field.contribution.value}
                                    />
                                  )}
                                  fieldDetails={fields}
                                />
                              )}
                            </ContributionFetcher>
                          </div>
                          <div className={classes.panel}>
                            <ShapeFetcher
                              rootShapeId={response.body.rootShapeId}
                              changesSinceBatchCommit={batchId}
                            >
                              {(shapes) => (
                                <HttpBodyPanel
                                  shapes={shapes}
                                  location={response.body!.contentType}
                                />
                              )}
                            </ShapeFetcher>
                          </div>
                        </>
                      ) : (
                        <>No Body Response</>
                      )}
                    </div>
                  </>
                )}
              </HttpBodySelector>
            </div>
          ))}
      </FullWidth>
    </>
  );
};

const useStyles = makeStyles((theme) => ({
  regularField: {
    fontSize: '1.25rem',
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
  },
  contents: {
    fontSize: 16,
    lineHeight: 1.6,
    color: '#4f566b',
    paddingRight: 50,
  },
  removedInfoHeader: {
    justifyContent: 'center',
    display: 'fixed',
  },
  bodyContainer: {
    marginTop: theme.spacing(6),
    width: '100%',
    height: '100%',
  },
  bodyHeaderContainer: {},
  bodyContributionContainer: {
    marginBottom: theme.spacing(2),
  },
  bodyHeader: {
    fontSize: '1.25rem',
    fontFamily: FontFamily,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    margin: theme.spacing(3, 0),
  },
  bodyDetails: {
    display: 'flex',
    width: '100%',
    height: '100%',
    '& > div': {
      width: '50%',
      padding: theme.spacing(0, 1),
    },
  },
  panel: {
    position: 'sticky',
    top: 50,
    alignSelf: 'flex-start',
  },
}));
