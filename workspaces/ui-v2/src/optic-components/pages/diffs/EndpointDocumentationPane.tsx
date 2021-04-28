import React, { FC, ReactNode } from 'react';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { EndpointName } from '../../common';
import { FullWidth } from '../../layouts/FullWidth';
import { PathParametersViewEdit } from '../../documentation/PathParameters';
import { EndpointTOC } from '../../documentation/EndpointTOC';
import { useEndpointBody } from '../../hooks/useEndpointBodyHook';
import { CodeBlock } from '../../documentation/BodyRender';
import { SubtleBlueBackground } from '../../theme';
import { Loading } from '../../loaders/Loading';
import { OneColumnBody } from '../../documentation/RenderBody';
import { IParsedLocation } from '../../../lib/Interfaces';
import { HighlightedLocation } from '../../diffs/render/HighlightedLocation';
import { useSimulatedCommands } from '../../diffs/contexts/SimulatedCommandContext';

type EndpointDocumentationPaneProps = {
  method: string;
  pathId: string;
  lastBatchCommit?: string;
  highlightBodyChanges?: boolean;
  highlightedLocation?: IParsedLocation;
  renderHeader: () => ReactNode;
};

export const EndpointDocumentationPane: FC<EndpointDocumentationPaneProps> = ({
  method,
  pathId,
  lastBatchCommit,
  highlightedLocation,
  highlightBodyChanges,
  renderHeader,
}) => {
  const { endpoints, loading } = useEndpoints();
  // const previewCommands = useSimulatedCommands();
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

  return (
    <FullWidth style={{ padding: 30, paddingTop: 15, paddingBottom: 400 }}>
      {/*<pre>{'simulated ' + JSON.stringify([...previewCommands], null, 2)}</pre>*/}
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
        <PathParametersViewEdit parameters={thisEndpoint.pathParameters} />
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
          <>
            <HighlightedLocation
              targetLocation={highlightedLocation}
              contentType={i.contentType}
              inRequest={true}
            >
              <OneColumnBody
                key={index}
                changes={highlightBodyChanges ? i.changes : undefined}
                changesSinceBatchCommitId={lastBatchCommit}
                rootShapeId={i.rootShapeId}
                bodyId={i.requestId}
                location={'Request Body Parameters'}
              />
            </HighlightedLocation>
            <div style={{ height: 50 }} />
          </>
        );
      })}
      {bodies.responses.map((i, index) => {
        return (
          <>
            <HighlightedLocation
              targetLocation={highlightedLocation}
              contentType={i.contentType}
              statusCode={i.statusCode}
              inResponse={true}
            >
              <OneColumnBody
                key={index}
                changes={highlightBodyChanges ? i.changes : undefined}
                changesSinceBatchCommitId={lastBatchCommit}
                rootShapeId={i.rootShapeId}
                bodyId={i.responseId}
                location={`${i.statusCode} Response`}
              />
            </HighlightedLocation>
            <div style={{ height: 50 }} />
          </>
        );
      })}
    </FullWidth>
  );
};
