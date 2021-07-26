import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';

import {
  EndpointName,
  PathParameters,
  FullWidth,
  ShapeFetcher,
  QueryParametersPanel,
  HttpBodyPanel,
  HttpBodySelector,
  convertShapeToQueryParameters,
  Panel,
} from '<src>/components';
import { EndpointTOC } from '<src>/pages/docs/components/EndpointTOC';
import { SubtleBlueBackground, FontFamily } from '<src>/styles';

import { DiffLocation } from '<src>/lib/parse-diff';
import {
  HighlightedLocation,
  Location,
} from '<src>/pages/diffs/components/HighlightedLocation';
import { selectors, useAppSelector } from '<src>/store';

type EndpointDocumentationPaneProps = {
  name: string;
  method: string;
  pathId: string;
  lastBatchCommit?: string;
  highlightBodyChanges?: boolean;
  highlightedLocation?: DiffLocation;
};

export const EndpointDocumentationPane: FC<
  EndpointDocumentationPaneProps & React.HtmlHTMLAttributes<HTMLDivElement>
> = ({
  name,
  method,
  pathId,
  lastBatchCommit,
  highlightedLocation,
  highlightBodyChanges,
  ...props
}) => {
  const classes = useStyles();
  const thisEndpoint = useAppSelector(
    selectors.getEndpoint({ pathId, method })
  );
  const endpointChanges = useAppSelector(
    (state) => state.endpoints.results.data?.changes || {}
  );
  const filteredRequests = selectors.filterRemovedItemForChangelog(
    thisEndpoint ? thisEndpoint.requests : [],
    endpointChanges,
    (request) => request.requestId
  );
  const filteredResponsesByStatusCode = selectors.filterMapOfRemovedItemForChangelog(
    thisEndpoint ? thisEndpoint.responsesByStatusCode : {},
    endpointChanges,
    (response) => response.responseId
  );

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );

  return (
    <FullWidth
      style={{ padding: 30, paddingTop: 15, paddingBottom: 400 }}
      {...props}
    >
      <p className={classes.nameDisplay}>{name}</p>
      <div style={{ height: 20 }} />
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
            query={thisEndpoint.query}
            requests={filteredRequests}
            responsesByStatusCode={filteredResponsesByStatusCode}
          />
        </div>
      </Panel>

      {thisEndpoint.query && (
        <HighlightedLocation
          className={classes.bodyContainer}
          targetLocation={highlightedLocation}
          expectedLocation={Location.Query}
        >
          <div id="query-parameters">
            <h6 className={classes.bodyHeader}>Query Parameters</h6>
            <div className={classes.bodyDetails}>
              <ShapeFetcher
                rootShapeId={thisEndpoint.query.rootShapeId}
                changesSinceBatchCommit={lastBatchCommit}
              >
                {(shapes) => (
                  <QueryParametersPanel
                    parameters={convertShapeToQueryParameters(shapes)}
                  />
                )}
              </ShapeFetcher>
            </div>
          </div>
        </HighlightedLocation>
      )}

      {filteredRequests.length > 0 && (
        <HighlightedLocation
          className={classes.bodyContainer}
          targetLocation={highlightedLocation}
          expectedLocation={Location.Request}
        >
          <div id="request-body">
            <h6 className={classes.bodyHeader}>Request Body</h6>
            <div className={classes.bodyDetails}>
              <HttpBodySelector
                items={filteredRequests}
                getDisplayName={(request) =>
                  request.body?.contentType || 'No Body'
                }
              >
                {(request) =>
                  request.body ? (
                    <ShapeFetcher
                      rootShapeId={request.body.rootShapeId}
                      changesSinceBatchCommit={lastBatchCommit}
                    >
                      {(shapes) => (
                        <HttpBodyPanel
                          shapes={shapes}
                          // Typescript cannot infer through render props for some reason
                          location={`Request Body ${request.body!.contentType}`}
                        />
                      )}
                    </ShapeFetcher>
                  ) : (
                    <div>No Body Request</div>
                  )
                }
              </HttpBodySelector>
            </div>
          </div>
        </HighlightedLocation>
      )}

      {selectors
        .getResponsesInSortedOrder(filteredResponsesByStatusCode)
        .map(([statusCode, responses]) => {
          return (
            <React.Fragment key={statusCode}>
              <HighlightedLocation
                className={classes.bodyContainer}
                targetLocation={highlightedLocation}
                statusCode={Number(statusCode)}
                expectedLocation={Location.Response}
              >
                <div id={statusCode}>
                  <h6 className={classes.bodyHeader}>{statusCode} response</h6>
                  <div className={classes.bodyDetails}>
                    <HttpBodySelector
                      items={responses}
                      getDisplayName={(response) =>
                        response.body?.contentType || 'No Body'
                      }
                    >
                      {(response) =>
                        response.body ? (
                          <ShapeFetcher
                            rootShapeId={response.body.rootShapeId}
                            changesSinceBatchCommit={lastBatchCommit}
                          >
                            {(shapes) => (
                              <HttpBodyPanel
                                shapes={shapes}
                                location={`${response.statusCode} response ${
                                  response.body!.contentType
                                }`}
                              />
                            )}
                          </ShapeFetcher>
                        ) : (
                          <div>No Body Request</div>
                        )
                      }
                    </HttpBodySelector>
                  </div>
                </div>
              </HighlightedLocation>
            </React.Fragment>
          );
        })}
    </FullWidth>
  );
};

const useStyles = makeStyles((theme) => ({
  bodyContainer: {
    margin: theme.spacing(3, 0),
  },
  bodyHeader: {
    fontSize: '1.25rem',
    fontFamily: FontFamily,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    marginTop: 0,
    marginBottom: theme.spacing(2),
  },
  bodyDetails: {
    padding: theme.spacing(0, 1),
  },
  nameDisplay: {
    fontSize: '1.25rem',
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
  },
}));
