import React, { FC, useMemo } from 'react';

import { useEndpoints } from '<src>/hooks/useEndpointsHook';
import { Typography } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import {
  EndpointName,
  PathParameters,
  Loading,
  IShapeRenderer,
  JsonLike,
  PageLayout,
} from '<src>/components';
import { useContributionEditing } from './contexts/Contributions';
import { FullWidth } from '<src>/components';
import { RouteComponentProps } from 'react-router-dom';
import { useEndpointBody } from '<src>/hooks/useEndpointBodyHook';
import { SubtleBlueBackground } from '<src>/constants/theme';
import { getEndpointId } from '<src>/utils';
import { useRunOnKeypress } from '<src>/hooks/util';
import {
  TwoColumnBody,
  CodeBlock,
  EndpointTOC,
  DocsFieldOrParameterContribution,
  EndpointNameContribution,
  DocsPageAccessoryNavigation,
  MarkdownBodyContribution,
  TwoColumn,
} from '<src>/pages/docs/components';

export const EndpointRootPageWithDocsNav: FC<
  React.ComponentProps<typeof EndpointRootPage>
> = (props) => (
  <PageLayout AccessoryNavigation={DocsPageAccessoryNavigation}>
    <EndpointRootPage {...props} isChangelogPage={false} />
  </PageLayout>
);

export const EndpointRootPage: FC<
  RouteComponentProps<{
    pathId: string;
    method: string;
  }> & {
    isChangelogPage?: boolean;
    changelogBatchId: string | undefined;
  }
> = ({ isChangelogPage, match, changelogBatchId }) => {
  const { endpoints, loading } = useEndpoints();

  const { pathId, method } = match.params;

  const bodies = useEndpointBody(pathId, method, changelogBatchId);
  const styles = useStyles();
  const thisEndpoint = useMemo(
    () => endpoints.find((i) => i.pathId === pathId && i.method === method),
    [pathId, method, endpoints]
  );
  const {
    isEditing,
    pendingCount,
    setCommitModalOpen,
  } = useContributionEditing();

  const onKeyPress = useRunOnKeypress(
    () => {
      if (isEditing && pendingCount > 0) {
        setCommitModalOpen(true);
      }
    },
    {
      keys: new Set(['Enter']),
      inputTagNames: new Set(['input']),
    }
  );

  if (loading) {
    return <Loading />;
  }

  if (!thisEndpoint) {
    return <>no endpoint here</>;
  }
  const endpointId = getEndpointId({ method, pathId });
  const parameterizedPathParts = thisEndpoint.pathParameters.filter(
    (path) => path.isParameterized
  );

  return (
    <FullWidth
      style={{ paddingTop: 30, paddingBottom: 400 }}
      onKeyPress={onKeyPress}
    >
      {/* @nic TODO fork documentation page from changelog page */}
      {isChangelogPage ? (
        <Typography className={styles.regularField}>
          {thisEndpoint.purpose || 'Unnamed Endpoint'}
        </Typography>
      ) : (
        <EndpointNameContribution
          id={endpointId}
          contributionKey="purpose"
          defaultText="What does this endpoint do?"
          initialValue={thisEndpoint.purpose}
        />
      )}
      <EndpointName
        fontSize={19}
        leftPad={0}
        method={thisEndpoint.method}
        fullPath={thisEndpoint.fullPath}
      />
      <TwoColumn
        style={{ marginTop: 5 }}
        left={
          <MarkdownBodyContribution
            id={endpointId}
            contributionKey={'description'}
            defaultText={'Describe this endpoint'}
            initialValue={thisEndpoint.description}
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
              renderField={(param, index) => {
                const alwaysAString: IShapeRenderer = {
                  shapeId: param.id + 'shape',
                  jsonType: JsonLike.STRING,
                  value: undefined,
                };
                return (
                  <DocsFieldOrParameterContribution
                    key={param.id}
                    id={param.id}
                    name={param.name}
                    shapes={[alwaysAString]}
                    depth={0}
                    initialValue={param.description}
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
          <TwoColumnBody
            key={index}
            changesSinceBatchCommitId={changelogBatchId}
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
          <TwoColumnBody
            key={index}
            changesSinceBatchCommitId={changelogBatchId}
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
}));
