import React, { FC, ReactNode } from 'react';
import { Divider, Typography, TextField } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { useEndpoints } from '../../hooks/useEndpointsHook';
import { EndpointName } from '../../common';
import { FullWidth } from '../../layouts/FullWidth';
import { EndpointTOC } from '../../documentation/EndpointTOC';
import { useEndpointBody } from '../../hooks/useEndpointBodyHook';
import { CodeBlock } from '../../documentation/BodyRender';
import { SubtleBlueBackground } from '../../theme';
import { Loading } from '../../loaders/Loading';
import { OneColumnBody } from '../../documentation/RenderBody';
import { IParsedLocation } from '../../../lib/Interfaces';
import { HighlightedLocation } from '../../diffs/render/HighlightedLocation';
import { useSimulatedCommands } from '../../diffs/contexts/SimulatedCommandContext';

import { IPathParameter } from '../../hooks/useEndpointsHook';
import { IShapeRenderer, JsonLike } from '../../shapes/ShapeRenderInterfaces';

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

// FOR EVERYTHING BELOW THIS
// This is forked from /documentation/PathParameters as they require different contexts
// TODO The intent here is to pull out shared presentational features and allow connections to
// different contexts
export type PathParametersViewEditProps = {
  parameters: IPathParameter[];
};

export function PathParametersViewEdit(props: PathParametersViewEditProps) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Typography className={classes.h6}>Path Parameters</Typography>
      {props.parameters.length === 0 && (
        <>
          <Divider
            style={{
              marginBottom: 5,
              backgroundColor: '#e4e8ed',
            }}
          />
          <Typography className={classes.none}>No path parameters.</Typography>
        </>
      )}

      {props.parameters.map((param, index) => {
        const alwaysAString: IShapeRenderer = {
          shapeId: param.pathComponentId + 'shape',
          jsonType: JsonLike.STRING,
          value: undefined,
        };
        return (
          <FieldOrParameterContribution
            key={index}
            id={param.pathComponentId}
            name={param.pathComponentName}
            shapes={[alwaysAString]}
            depth={0}
            // @nic todo
            initialValue=""
          />
        );
      })}
    </div>
  );
}

export type FieldOrParameterContributionProps = {
  shapes: IShapeRenderer[];
  id: string;
  name: string;
  depth: number;
  initialValue: string;
};

function summarizeTypes(shapes: IShapeRenderer[]) {
  if (shapes.length === 1) {
    return shapes[0].jsonType.toString().toLowerCase();
  } else {
    const allShapes = shapes.map((i) => i.jsonType.toString().toLowerCase());
    const last = allShapes.pop();
    return allShapes.join(', ') + ' or ' + last;
  }
}

export function FieldOrParameterContribution({
  name,
  id,
  shapes,
  depth,
  initialValue,
}: FieldOrParameterContributionProps) {
  const classes = useStyles();
  const isEditing = false;
  const value = initialValue;

  return (
    <div
      className={classes.containerForField}
      style={{ paddingLeft: depth * 14 }}
    >
      <div className={classes.topRow}>
        <div className={classes.keyName}>{name}</div>
        <div className={classes.shape}>{summarizeTypes(shapes)}</div>
      </div>
      {isEditing ? (
        <TextField
          inputProps={{ className: classes.description }}
          fullWidth
          placeholder={`What is ${name}? How is it used?`}
          multiline
          value={value}
          // onChange={(e: ChangeEvent<HTMLInputElement>) => {
          //   setValue(e.target.value);
          // }}
        />
      ) : (
        <div className={classes.description}>{value}</div>
      )}
    </div>
  );
}
const useStyles = makeStyles((theme) => ({
  container: {
    paddingLeft: 10,
    paddingTop: 10,
  },
  h6: {
    fontSize: 13,
    fontFamily: 'Ubuntu, Inter',
    fontWeight: 500,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  none: {
    color: '#8792a2',
    fontSize: 12,
  },
  keyName: {
    color: '#3c4257',
    fontWeight: 600,
    fontSize: 13,
    fontFamily: 'Ubuntu',
  },

  shape: {
    marginLeft: 6,
    fontFamily: 'Ubuntu Mono',
    fontSize: 12,
    fontWeight: 400,
    color: '#8792a2',
    height: 18,
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: 9,
    paddingBottom: 6,
  },

  description: {
    fontFamily: 'Ubuntu',
    fontWeight: 200,
    fontSize: 14,
    lineHeight: 1.8,
    color: '#4f566b',
  },
  containerForField: {
    marginBottom: 9,
    paddingLeft: 3,
    borderTop: '1px solid #e4e8ed',
  },
}));
