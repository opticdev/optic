import * as React from 'react';
import { useMemo } from 'react';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { EndpointName } from '../../documentation/EndpointName';
import { FullWidth } from '../../layouts/FullWidth';
import { EndpointNameContribution } from '../../documentation/Contributions';
import { PathParametersViewEdit } from '../../documentation/PathParameters';
import { EndpointTOC } from '../../documentation/EndpointTOC';
import { useEndpointBody } from '../../hooks/useEndpointBodyHook';
import { CodeBlock } from '../../documentation/BodyRender';
import { SubtleBlueBackground } from '../../theme';
import { getEndpointId } from '../../utilities/endpoint-utilities';
import { Loading } from '../../navigation/Loading';
import { OneColumnBody } from '../../documentation/RenderBody';

export function EndpointDocumentationPane({
  method,
  pathId,
}: {
  method: string;
  pathId: string;
}) {
  const { endpoints, loading } = useEndpoints();
  const bodies = useEndpointBody(pathId, method);

  const thisEndpoint = useMemo(
    () => endpoints.find((i) => i.pathId === pathId && i.method === method),
    [pathId, method, endpoints]
  );

  if (loading) {
    return <Loading />;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }

  const endpointId = getEndpointId({ method, pathId });

  return (
    <FullWidth style={{ padding: 30, paddingTop: 15, paddingBottom: 400 }}>
      <EndpointNameContribution
        id={endpointId}
        contributionKey="purpose"
        defaultText="What does this endpoint do?"
      />

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

      {bodies.requests.map((i, index) => {
        return (
          <OneColumnBody
            key={index}
            rootShapeId={i.rootShapeId}
            bodyId={i.requestId}
            location={'Request Body Parameters'}
          />
        );
      })}
      {bodies.responses.map((i, index) => {
        return (
          <OneColumnBody
            key={index}
            rootShapeId={i.rootShapeId}
            bodyId={i.responseId}
            location={`${i.statusCode} Response`}
          />
        );
      })}
    </FullWidth>
  );
}
