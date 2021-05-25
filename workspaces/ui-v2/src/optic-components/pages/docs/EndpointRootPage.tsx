import React, { FC, useMemo } from 'react';

import { useEndpoints } from '<src>/optic-components/hooks/useEndpointsHook';
import { Typography } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import { EndpointName, PathParameters } from '<src>/optic-components/common';
import { useContributionEditing } from '<src>/optic-components/hooks/edit/Contributions';
import { FullWidth } from '<src>/optic-components/layouts/FullWidth';
import { EndpointNameContribution } from '<src>/optic-components/documentation/Contributions';
import { MarkdownBodyContribution } from '<src>/optic-components/documentation/MarkdownBodyContribution';
import { TwoColumn } from '<src>/optic-components/documentation/TwoColumn';
import { RouteComponentProps } from 'react-router-dom';
import { DocsFieldOrParameterContribution } from '<src>/optic-components/documentation/Contributions';
import { EndpointTOC } from '<src>/optic-components/documentation/EndpointTOC';
import { useEndpointBody } from '<src>/optic-components/hooks/useEndpointBodyHook';
import { CodeBlock } from '<src>/optic-components/documentation/BodyRender';
import { SubtleBlueBackground } from '<src>/optic-components/theme';
import { TwoColumnBody } from '<src>/optic-components/documentation/RenderBody';
import { getEndpointId } from '<src>/optic-components/utilities/endpoint-utilities';
import { Loading } from '<src>/optic-components/loaders/Loading';
import {
  IShapeRenderer,
  JsonLike,
} from '<src>/optic-components/shapes/ShapeRenderInterfaces';
import { useRunOnKeypress } from '<src>/optic-components/hooks/util';
import { PageLayout } from '<src>/optic-components/layouts/PageLayout';
import { DocsPageAccessoryNavigation } from '<src>/optic-components/pages/docs/components';

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
