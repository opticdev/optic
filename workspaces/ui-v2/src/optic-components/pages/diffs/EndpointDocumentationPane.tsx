import React, { FC, ReactNode } from 'react';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { EndpointName, PathParameters, FieldOrParameter } from '../../common';
import { FullWidth } from '../../layouts/FullWidth';
import { EndpointTOC } from '../../documentation/EndpointTOC';
import { useEndpointBody } from '../../hooks/useEndpointBodyHook';
import { CodeBlock } from '../../documentation/BodyRender';
import { SubtleBlueBackground } from '../../theme';
import { Loading } from '../../loaders/Loading';
import { OneColumnBody } from '../../documentation/RenderBody';
import { IParsedLocation } from '../../../lib/Interfaces';
import { HighlightedLocation } from '../../diffs/render/HighlightedLocation';
import { useSharedDiffContext } from '../../hooks/diffs/SharedDiffContext';
import { IPathParameter } from '../../hooks/useEndpointsHook';
import { IShapeRenderer, JsonLike } from '../../shapes/ShapeRenderInterfaces';
import { useDebouncedFn, useStateWithSideEffect } from '../../hooks/util';
import { getEndpointId } from '../../utilities/endpoint-utilities';

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
  const { endpoints, loading } = useEndpoints();
  const bodies = useEndpointBody(pathId, method, lastBatchCommit);

  const thisEndpoint = endpoints.find(
    (i) => i.pathId === pathId && i.method === method
  );
  if (loading) {
    return <Loading />;
  }

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
            requests={bodies.requests}
            responses={bodies.responses}
          />
        </div>
      </CodeBlock>
      <div style={{ height: 50 }} />
      {bodies.requests.map((i, index) => {
        return (
          <React.Fragment key={i.requestId}>
            <HighlightedLocation
              targetLocation={highlightedLocation}
              contentType={i.contentType}
              inRequest={true}
            >
              <OneColumnBody
                changes={highlightBodyChanges ? i.changes : undefined}
                changesSinceBatchCommitId={lastBatchCommit}
                rootShapeId={i.rootShapeId}
                bodyId={i.requestId}
                location={'Request Body Parameters'}
              />
            </HighlightedLocation>
            <div style={{ height: 50 }} />
          </React.Fragment>
        );
      })}
      {bodies.responses.map((i, index) => {
        return (
          <React.Fragment key={i.responseId}>
            <HighlightedLocation
              targetLocation={highlightedLocation}
              contentType={i.contentType}
              statusCode={i.statusCode}
              inResponse={true}
            >
              <OneColumnBody
                changes={highlightBodyChanges ? i.changes : undefined}
                changesSinceBatchCommitId={lastBatchCommit}
                rootShapeId={i.rootShapeId}
                bodyId={i.responseId}
                location={`${i.statusCode} Response`}
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
