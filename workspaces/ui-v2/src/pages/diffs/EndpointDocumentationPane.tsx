import React, { FC, ReactNode } from 'react';
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
  convertShapeToQueryParameters,
} from '<src>/components';
import { EndpointTOC } from '<src>/pages/docs/components/EndpointTOC';
import { CodeBlock } from '<src>/pages/docs/components/BodyRender';
import { SubtleBlueBackground, FontFamily } from '<src>/styles';
import { OneColumnBody } from '<src>/pages/docs/components/RenderBody';
import { IParsedLocation } from '<src>/lib/Interfaces';
import {
  HighlightedLocation,
  Location,
} from '<src>/pages/diffs/components/HighlightedLocation';
import { useSharedDiffContext } from '<src>/pages/diffs/contexts/SharedDiffContext';
import { useEndpointsBodyChanges } from '<src>/hooks/useEndpointsBodyChanges';
import { useDebouncedFn, useStateWithSideEffect } from '<src>/hooks/util';
import { selectors, useAppSelector } from '<src>/store';
import { IPathParameter } from '<src>/types';
import { getEndpointId } from '<src>/utils';

type EndpointDocumentationPaneProps = {
  method: string;
  pathId: string;
  lastBatchCommit?: string;
  highlightBodyChanges?: boolean;
  highlightedLocation?: IParsedLocation;
  renderHeader: () => ReactNode;
};

export const EndpointDocumentationPane: FC<
  EndpointDocumentationPaneProps & React.HtmlHTMLAttributes<HTMLDivElement>
> = ({
  method,
  pathId,
  lastBatchCommit,
  highlightedLocation,
  highlightBodyChanges,
  renderHeader,
  ...props
}) => {
  const classes = useStyles();
  const thisEndpoint = useAppSelector(
    selectors.getEndpoint({ pathId, method })
  );
  const endpointBodyChanges = useEndpointsBodyChanges(lastBatchCommit);

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );
  const endpointId = getEndpointId({
    pathId: thisEndpoint.pathId,
    method: thisEndpoint.method,
  });

  return (
    <FullWidth
      style={{ padding: 30, paddingTop: 15, paddingBottom: 400 }}
      {...props}
    >
      {renderHeader()}
      <div style={{ height: 20 }} />
      <CodeBlock
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
            return (
              <DiffPathParamField
                key={param.id}
                pathParameter={param}
                endpointId={endpointId}
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
      </CodeBlock>
      <div style={{ height: 50 }} />

      {thisEndpoint.query && (
        <HighlightedLocation
          targetLocation={highlightedLocation}
          expectedLocation={Location.Query}
        >
          {/* TODO QPB - change id from this to query id from spectacle */}
          <div className={classes.bodyContainer} id="query-parameters">
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
            targetLocation={highlightedLocation}
            contentType={requestBody.contentType}
            expectedLocation={Location.Request}
          >
            <OneColumnBody
              changes={
                highlightBodyChanges
                  ? endpointBodyChanges[requestBody.requestId]
                  : undefined
              }
              changesSinceBatchCommitId={lastBatchCommit}
              rootShapeId={requestBody.rootShapeId}
              bodyId={requestBody.requestId}
              location={'Request Body'}
              contentType={requestBody.contentType}
            />
          </HighlightedLocation>
          <div style={{ height: 50 }} />
        </React.Fragment>
      ))}
      {thisEndpoint.responseBodies.map((i, index) => {
        return (
          <React.Fragment key={i.responseId}>
            <HighlightedLocation
              targetLocation={highlightedLocation}
              contentType={i.contentType}
              statusCode={i.statusCode}
              expectedLocation={Location.Response}
            >
              <OneColumnBody
                changes={
                  highlightBodyChanges
                    ? endpointBodyChanges[i.responseId]
                    : undefined
                }
                changesSinceBatchCommitId={lastBatchCommit}
                rootShapeId={i.rootShapeId}
                bodyId={i.responseId}
                location={`${i.statusCode} response`}
                contentType={i.contentType}
              />
            </HighlightedLocation>
            <div style={{ height: 50 }} />
          </React.Fragment>
        );
      })}
    </FullWidth>
  );
};

const DiffPathParamField: FC<{
  pathParameter: IPathParameter;
  endpointId: string;
}> = ({ pathParameter, endpointId }) => {
  const alwaysAString: IShapeRenderer = {
    shapeId: pathParameter.id + 'shape',
    jsonType: JsonLike.STRING,
    value: undefined,
  };

  const {
    setPathDescription,
    getContributedPathDescription,
  } = useSharedDiffContext();

  const debouncedAddContribution = useDebouncedFn(setPathDescription, 200);
  const { value, setValue } = useStateWithSideEffect({
    initialValue:
      getContributedPathDescription(pathParameter.id) ||
      pathParameter.description,
    sideEffect: (description: string) =>
      debouncedAddContribution(pathParameter.id, description, endpointId),
  });

  return (
    <FieldOrParameter
      isEditing={true}
      shapes={[alwaysAString]}
      depth={0}
      name={pathParameter.name}
      value={value}
      setValue={setValue}
    />
  );
};

const useStyles = makeStyles((theme) => ({
  bodyContainer: {
    width: '100%',
    margin: `${theme.spacing(3)}px 0`,
  },
  bodyHeader: {
    fontSize: '1.25rem',
    fontFamily: FontFamily,
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
    margin: `${theme.spacing(3)}px 0`,
  },
  bodyDetails: {
    padding: `0 ${theme.spacing(1)}px`,
  },
}));
