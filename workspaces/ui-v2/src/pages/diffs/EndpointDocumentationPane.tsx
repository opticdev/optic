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
            requests={thisEndpoint.requests}
            responses={thisEndpoint.responses}
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

      {thisEndpoint.requests.length > 0 && (
        <HighlightedLocation
          className={classes.bodyContainer}
          targetLocation={highlightedLocation}
          // TODO remove content type from highlighted request?
          contentType={'contentType'}
          expectedLocation={Location.Request}
        >
          <div id="request-body">
            <h6 className={classes.bodyHeader}>Request Body</h6>
            <div className={classes.bodyDetails}>
              <HttpBodySelector
                items={thisEndpoint.requests}
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
                    // TODO make this the same as the other three
                    <div>No body details found</div>
                  )
                }
              </HttpBodySelector>
            </div>
          </div>
        </HighlightedLocation>
      )}

      {thisEndpoint.responses.map((response) => {
        return (
          <React.Fragment key={response.responseId}>
            <HighlightedLocation
              className={classes.bodyContainer}
              targetLocation={highlightedLocation}
              // TODO fix content type
              contentType={'body.contentType'}
              statusCode={response.statusCode}
              expectedLocation={Location.Response}
            >
              <div id={response.responseId}>
                <h6 className={classes.bodyHeader}>
                  {response.statusCode} response
                </h6>
                <div className={classes.bodyDetails}>
                  <HttpBodySelector
                    items={response.bodies}
                    getDisplayName={(body) => body.contentType}
                  >
                    {(body) => (
                      <ShapeFetcher
                        rootShapeId={body.rootShapeId}
                        changesSinceBatchCommit={lastBatchCommit}
                      >
                        {(shapes) => (
                          <HttpBodyPanel
                            shapes={shapes}
                            location={`${response.statusCode} response ${body.contentType}`}
                          />
                        )}
                      </ShapeFetcher>
                    )}
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
