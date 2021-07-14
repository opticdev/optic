import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';

import {
  EndpointName,
  PathParameters,
  FieldOrParameter,
  FullWidth,
  IShapeRenderer,
  JsonLike,
  ShapeFetcher,
  QueryParametersPanel,
  HttpBodyPanel,
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
        <PathParameters
          parameters={parameterizedPathParts}
          renderField={(param) => {
            const alwaysAString: IShapeRenderer = {
              shapeId: param.id + 'shape',
              jsonType: JsonLike.STRING,
              value: undefined,
            };
            return (
              <FieldOrParameter
                key={param.id}
                name={param.name}
                shapes={[alwaysAString]}
                depth={0}
                value={param.description}
              />
            );
          }}
        />
        <div
          style={{
            marginTop: 10,
            backgroundColor: SubtleBlueBackground,
            borderTop: '1px solid #e2e2e2',
          }}
        >
          <EndpointTOC
            query={thisEndpoint.query}
            requests={thisEndpoint.requestBodies}
            responses={thisEndpoint.responseBodies}
          />
        </div>
      </Panel>

      {thisEndpoint.query && (
        <HighlightedLocation
          className={classes.bodyContainer}
          targetLocation={highlightedLocation}
          expectedLocation={Location.Query}
        >
          <div id={thisEndpoint.query.queryParametersId}>
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

      {thisEndpoint.requestBodies.map((requestBody) => (
        <React.Fragment key={requestBody.requestId}>
          <HighlightedLocation
            className={classes.bodyContainer}
            targetLocation={highlightedLocation}
            contentType={requestBody.contentType}
            expectedLocation={Location.Request}
          >
            <div id={requestBody.requestId}>
              <h6 className={classes.bodyHeader}>Request Body</h6>
              <div className={classes.bodyDetails}>
                <ShapeFetcher
                  rootShapeId={requestBody.rootShapeId}
                  changesSinceBatchCommit={lastBatchCommit}
                >
                  {(shapes) => (
                    <HttpBodyPanel
                      shapes={shapes}
                      location={`Request Body ${requestBody.contentType}`}
                    />
                  )}
                </ShapeFetcher>
              </div>
            </div>
          </HighlightedLocation>
        </React.Fragment>
      ))}
      {thisEndpoint.responseBodies.map((responseBody) => {
        return (
          <React.Fragment key={responseBody.responseId}>
            <HighlightedLocation
              className={classes.bodyContainer}
              targetLocation={highlightedLocation}
              contentType={responseBody.contentType}
              statusCode={responseBody.statusCode}
              expectedLocation={Location.Response}
            >
              <div id={responseBody.responseId}>
                <h6 className={classes.bodyHeader}>
                  {responseBody.statusCode} response
                </h6>
                <div className={classes.bodyDetails}>
                  <ShapeFetcher
                    rootShapeId={responseBody.rootShapeId}
                    changesSinceBatchCommit={lastBatchCommit}
                  >
                    {(shapes) => (
                      <HttpBodyPanel
                        shapes={shapes}
                        location={`${responseBody.statusCode} response ${responseBody.contentType}`}
                      />
                    )}
                  </ShapeFetcher>
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
