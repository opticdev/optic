import React, { FC, useMemo } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Typography } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import ReactMarkdown from 'react-markdown';

import {
  EndpointName,
  PathParameters,
  Loading,
  IShapeRenderer,
  JsonLike,
  PageLayout,
  FullWidth,
  FieldOrParameter,
} from '<src>/components';
import { useEndpointBody } from '<src>/hooks/useEndpointBodyHook';
import { SubtleBlueBackground } from '<src>/constants/theme';
import { CodeBlock, EndpointTOC, TwoColumn } from '<src>/pages/docs/components';
import { useAppSelector } from '<src>/store';

import {
  ChangelogPageAccessoryNavigation,
  ValidateBatchId,
  TwoColumnBodyChangelog,
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
  const endpointsState = useAppSelector((state) => state.endpoints.results);

  const { pathId, method, batchId } = match.params;
  const thisEndpoint = useMemo(
    () =>
      endpointsState.data?.find(
        (i) => i.pathId === pathId && i.method === method
      ),
    [endpointsState, method, pathId]
  );

  const bodies = useEndpointBody(pathId, method, batchId);
  const styles = useStyles();

  if (endpointsState.loading) {
    return <Loading />;
  }
  if (endpointsState.error) {
    return <>error</>;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );

  return (
    <FullWidth style={{ paddingTop: 30, paddingBottom: 400 }}>
      <Typography className={styles.regularField}>
        {thisEndpoint.purpose || 'Unnamed Endpoint'}
      </Typography>
      <EndpointName
        fontSize={19}
        leftPad={0}
        method={thisEndpoint.method}
        fullPath={thisEndpoint.fullPath}
      />
      <TwoColumn
        style={{ marginTop: 5 }}
        left={
          <ReactMarkdown
            className={styles.contents}
            source={thisEndpoint.description}
          />
        }
        right={
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
                requests={bodies.requests}
                responses={bodies.responses}
              />
            </div>
          </CodeBlock>
        }
      />

      {bodies.requests.map((i, index) => {
        return (
          <TwoColumnBodyChangelog
            key={i.rootShapeId}
            changesSinceBatchCommitId={batchId}
            rootShapeId={i.rootShapeId}
            bodyId={i.requestId}
            location={'Request Body'}
            contentType={i.contentType}
            description={i.description}
          />
        );
      })}
      {bodies.responses.map((i, index) => {
        return (
          <TwoColumnBodyChangelog
            key={i.rootShapeId}
            changesSinceBatchCommitId={batchId}
            rootShapeId={i.rootShapeId}
            bodyId={i.responseId}
            location={`${i.statusCode} Response`}
            contentType={i.contentType}
            description={i.description}
          />
        );
      })}
    </FullWidth>
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
}));
